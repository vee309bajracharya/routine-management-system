<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Class Routine - {{ $routine->batch->batch_name ?? '' }}</title>
    <style>
        @page {
            margin: 20px;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .header-section {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #062873;
            padding-bottom: 10px;
        }

        .institution-name {
            font-size: 22px;
            font-weight: bold;
            color: #215bd9;
            margin: 0;
        }

        .routine-title {
            font-size: 20px;
            font-weight: 400;
            margin: 5px 0;
            color: #192133;
        }

        .meta-info {
            font-size: 11px;
            color: #666;
            margin-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        th,
        td {
            border: 1px solid #cbd5e1;
            padding: 8px 4px;
            text-align: center;
            vertical-align: middle;
        }

        /* Table Headers */
        thead th {
            background-color: #f8fafc;
            color: #1e293b;
            font-weight: bold;
            font-size: 10px;
            height: 35px;
        }

        .day-column {
            background-color: #f1f5f9;
            font-weight: bold;
            width: 70px;
            color: #1e293b;
        }

        .course-name {
            font-weight: bold;
            color: #0f172a;
            font-size: 10px;
            display: block;
            margin-bottom: 2px;
        }

        .teacher-name {
            color: #475569;
            font-size: 9px;
        }

        .room-label {
            color: #64748b;
            font-size: 8px;
            margin-top: 2px;
            display: block;
        }

        .entry-type {
            color: #64748b;
            font-size: 8px;
            font-weight: bold;
            margin-top: 3px;
            display: block;
        }

        .break-cell {
            background-color: #f8fafc;
            font-weight: bold;
            color: #64748b;
            font-size: 12px;
            letter-spacing: 2px;
        }

        .empty-cell {
            color: #e2e8f0;
        }

        .watermark {
            position: fixed;
            top: 40%;
            left: 25%;
            font-size: 100px;
            color: rgba(0, 0, 0, 0.05);
            transform: rotate(-30deg);
            z-index: -1000;
        }

        .footer {
            margin-top: 15px;
            font-size: 8px;
            color: #999;
            text-align: right;
        }
    </style>
</head>

<body>

    @if($status === 'draft')
        <div class="watermark">Draft</div>
    @endif

    <section>
        <div class="header-section">
            <h1 class="institution-name">{{ $routine->institution->institution_name ?? 'Institution' }}</h1>
            <div class="routine-title">{{ $routine->title }}</div>
            <div class="meta-info">
                <strong>Semester:</strong> {{ $routine->semester->semester_name ?? 'N/A' }} |
                <strong>Batch:</strong> {{ $routine->batch->batch_name ?? 'N/A' }} |
                <strong>Shift:</strong> {{ ucfirst($shift) }}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="day-column">Day / Time</th>
                    @foreach($timeSlots as $slot)
                        <th>
                            {{ $slot->start_time->format('H:i') }} - {{ $slot->end_time->format('H:i') }}
                        </th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @php
                    $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                @endphp

                @foreach($days as $day)
                            <tr>
                                <td class="day-column">{{ $day }}</td>

                                @foreach($timeSlots as $slot)
                                            @php 
                                                $timeKey = $slot->start_time->format('H:i');
                                                $data = $grid[$day][$timeKey] ?? null; 
                                            @endphp

                                         @if($slot->slot_type === 'Break')
                                            <td class="break-cell">BREAK</td>
                                        @else
                                        <td>
                                            @if($data)
                                                <span class="course-name">{{ $data['course_name'] }}</span>
                                                <span class="teacher-name">{{ $data['teacher_name'] }}</span>
                                                <span class="room-label">Room: {{ $data['room_label'] }}</span>
                                                <span class="entry-type">{{ $data['entry_type'] }}</span>
                                            @else
                                                <span class="empty-cell">—</span>
                                            @endif
                                        </td>
                                    @endif
                                @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            Generated on: {{ now()->format('d M Y, h:i A') }}
        </div>
    </section>


</body>

</html>