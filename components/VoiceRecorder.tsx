'use client';

import { useState, useRef } from 'react';

export default function VoiceRecorder({ trackId }: { trackId?: string }) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isSending, setIsSending] = useState(false);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const sendRecording = async () => {
        if (!audioBlob) return;
        setIsSending(true);

        const userId = localStorage.getItem('userId');
        // If not found in localStorage (maybe stored as 'user' object), try that
        let finalUserId = userId;
        if (!finalUserId) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const params = JSON.parse(userStr);
                    finalUserId = params.id;
                } catch (e) { console.error(e) }
            }
        }

        if (!finalUserId) return alert('Please log in to send a message');

        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-message.webm');
        formData.append('userId', finalUserId);
        if (trackId) formData.append('audioTrackId', trackId);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                alert('Voice message sent!');
                setAudioBlob(null);
            } else {
                throw new Error('Failed to send');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex gap-4 items-center">
                {!isRecording && !audioBlob && (
                    <button
                        onClick={startRecording}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-full animate-pulse"
                    >
                        ● Record
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold py-2 px-4 rounded-full"
                    >
                        ■ Stop
                    </button>
                )}

                {audioBlob && (
                    <div className="flex flex-col gap-2 w-full">
                        <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-8" />
                        <div className="flex gap-2">
                            <button
                                onClick={sendRecording}
                                disabled={isSending}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded flex-1"
                            >
                                {isSending ? 'Sending...' : 'Send'}
                            </button>
                            <button
                                onClick={() => setAudioBlob(null)}
                                className="bg-slate-600 hover:bg-slate-500 text-white text-sm py-1 px-3 rounded"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
