<?php

namespace App\Notifications;

use App\Models\Routine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Barryvdh\DomPDF\Facade\Pdf;

class RoutinePublishedNotificiation extends Notification implements ShouldQueue
{
    use Queueable;

    public $tries = 5; // retry 5 times before giving up
    public $backoff = 30; // wait 30 seconds before retrying

    protected $routine;

    /**
     * Create a new notification instance.
     */
    public function __construct(Routine $routine)
    {
        $this->routine = $routine;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $routine = Routine::with([
            'institution',
            'semester',
            'batch'
        ])->findOrFail($this->routine->id);

        // get the prep. data for pdf
        $data = $routine->getPdfData();

        // generate the PDF using the correct view path
        $pdf = Pdf::loadView('routines.pdf.routine', $data)
            ->setPaper('a4', 'landscape');

        $pdfContent = $pdf->output();

        return (new MailMessage)
            ->subject('New Routine Published : ' . $routine->title)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A new academic routine has been published that includes your scheduled classes.')
            ->line('Routine Title : ' . $routine->title)
            ->attachData($pdfContent, 'routine_' . now()->format('Y_m_d') . '.pdf', [
                'mime' => 'application/pdf',
            ])
            ->action('View My Schedule', url('/teacher/routine'))
            ->line('Please find the attached PDF for your offline reference.')
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *  - gets saved in the 'notifications' table for the bell icon
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'routine_id' => $this->routine->id,
            'title' => 'New Routine Published',
            'message' => "The routine '{$this->routine->title}' is now live.",
            'action_url' => '/teacher/routine?id=' . $this->routine->id,
            'type' => 'publication'
        ];
    }
}
