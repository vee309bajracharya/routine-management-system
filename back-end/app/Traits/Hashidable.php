<?php

namespace App\Traits;
use Vinkla\Hashids\Facades\Hashids;

trait Hashidable
{
    public function encodeId($id)
    {
        return Hashids::encode($id);
    }

    public function decodeId($hash)
    {
        $decoded = Hashids::decode($hash);
        return empty($decoded) ? null : $decoded[0]; //decoding always returns an array
    }
}
