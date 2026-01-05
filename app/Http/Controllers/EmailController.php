<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PHPMailerService;
use Inertia\Inertia;

class EmailController extends Controller
{
    public function index()
    {
        return Inertia::render('SendMail');
    }

    public function send(Request $request)
    {
        $request->validate([
            'email'   => 'required|email',
            'subject' => 'required',
            'message' => 'required',
        ]);

        $result = PHPMailerService::send(
            $request->email,
            $request->subject,
            nl2br($request->message)
        );

        if ($result === true) {
            return back()->with('success', 'Email berhasil dikirim');
        }

        return back()->withErrors(['error' => $result]);
    }
}
