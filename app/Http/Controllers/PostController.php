<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    private function isAdmin(Request $request): bool
    {
        $email = $request->user()?->email;

        if (! is_string($email)) {
            return false;
        }

        return strtolower(trim($email)) === strtolower('admin@test.com');
    }

    public function index(Request $request): Response
    {
        $posts = Post::query()
            ->with(['user:id,name', 'comments.user:id,name'])
            ->latest()
            ->get();

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
            'authUser' => $request->user()
                ? $request->user()->only(['id', 'name'])
                : null,
            'isAdmin' => $this->isAdmin($request),
        ]);
    }

    public function store(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ]);

        $request->user()->posts()->create($validated);

        return Inertia::location(route('blog.index'));
    }

    public function update(Request $request, Post $post): \Symfony\Component\HttpFoundation\Response
    {
        if ($request->user()->id !== $post->user_id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
        ]);

        $post->update($validated);

        return Inertia::location(route('blog.index'));
    }

    public function destroy(Request $request, Post $post): \Symfony\Component\HttpFoundation\Response
    {
        $user = $request->user();

        if (! $this->isAdmin($request) && $user?->id !== $post->user_id) {
            abort(403);
        }

        $post->delete();

        return Inertia::location(route('blog.index'));
    }
}
