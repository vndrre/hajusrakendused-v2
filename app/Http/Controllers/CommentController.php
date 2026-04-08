<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommentController extends Controller
{
    private function isAdmin(Request $request): bool
    {
        $email = $request->user()?->email;

        if (! is_string($email)) {
            return false;
        }

        return strtolower(trim($email)) === strtolower('admin@test.com');
    }

    public function store(Request $request, Post $post): \Symfony\Component\HttpFoundation\Response
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return Inertia::location(route('blog.index'));
    }

    public function destroy(Request $request, Comment $comment): \Symfony\Component\HttpFoundation\Response
    {
        $user = $request->user();

        if (! $this->isAdmin($request) && $user?->id !== $comment->user_id) {
            abort(403);
        }

        $comment->delete();

        return Inertia::location(route('blog.index'));
    }

    public function update(Request $request, Comment $comment): \Symfony\Component\HttpFoundation\Response
    {
        if ($request->user()->id !== $comment->user_id) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $comment->update([
            'body' => $validated['body'],
        ]);

        return Inertia::location(route('blog.index'));
    }
}
