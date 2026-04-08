<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('shows the blog index for authenticated users', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/blog')
        ->assertSuccessful()
        ->assertInertia(fn ($page): mixed => $page->component('Blog/Index'));
});

it('allows creating a post', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('blog.store'), [
            'title' => 'My first post',
            'description' => 'Hello world',
        ])
        ->assertRedirect(route('blog.index'));

    expect(Post::query()->count())->toBe(1);
});

it('allows the post author to delete their own post', function (): void {
    $user = User::factory()->create();
    $post = Post::query()->create([
        'user_id' => $user->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $this->actingAs($user)
        ->delete(route('blog.destroy', $post))
        ->assertRedirect(route('blog.index'));

    expect(Post::query()->count())->toBe(0);
});

it('prevents other users from deleting a post', function (): void {
    $author = User::factory()->create();
    $otherUser = User::factory()->create();
    $post = Post::query()->create([
        'user_id' => $author->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $this->actingAs($otherUser)
        ->delete(route('blog.destroy', $post))
        ->assertForbidden();
});

it('allows the admin to delete other users posts', function (): void {
    $admin = User::factory()->create(['email' => 'admin@test.com']);
    $author = User::factory()->create();

    $post = Post::query()->create([
        'user_id' => $author->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $this->actingAs($admin)
        ->delete(route('blog.destroy', $post))
        ->assertRedirect(route('blog.index'));

    expect(Post::query()->count())->toBe(0);
});

it('allows the comment author to delete their own comment', function (): void {
    $author = User::factory()->create();
    $post = Post::query()->create([
        'user_id' => $author->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $comment = $post->comments()->create([
        'user_id' => $author->id,
        'body' => 'Nice!',
    ]);

    $this->actingAs($author)
        ->delete(route('comments.destroy', $comment))
        ->assertRedirect(route('blog.index'));

    expect(Comment::query()->count())->toBe(0);
});

it('allows the admin to delete other users comments', function (): void {
    $admin = User::factory()->create(['email' => 'admin@test.com']);
    $author = User::factory()->create();

    $post = Post::query()->create([
        'user_id' => $author->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $comment = $post->comments()->create([
        'user_id' => $author->id,
        'body' => 'Nice!',
    ]);

    $this->actingAs($admin)
        ->delete(route('comments.destroy', $comment))
        ->assertRedirect(route('blog.index'));

    expect(Comment::query()->count())->toBe(0);
});

it('prevents the post author from deleting comments they did not write', function (): void {
    $postAuthor = User::factory()->create();
    $commentAuthor = User::factory()->create();

    $post = Post::query()->create([
        'user_id' => $postAuthor->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $comment = $post->comments()->create([
        'user_id' => $commentAuthor->id,
        'body' => 'Nice!',
    ]);

    $this->actingAs($postAuthor)
        ->delete(route('comments.destroy', $comment))
        ->assertForbidden();
});

it('allows the post author to update their post', function (): void {
    $user = User::factory()->create();
    $post = Post::query()->create([
        'user_id' => $user->id,
        'title' => 'Old title',
        'description' => 'Old description',
    ]);

    $this->actingAs($user)
        ->put(route('blog.update', $post), [
            'title' => 'New title',
            'description' => 'New description',
        ])
        ->assertRedirect(route('blog.index'));

    expect($post->fresh()->title)->toBe('New title');
});

it('prevents other users from updating a post', function (): void {
    $author = User::factory()->create();
    $otherUser = User::factory()->create();

    $post = Post::query()->create([
        'user_id' => $author->id,
        'title' => 'Old title',
        'description' => 'Old description',
    ]);

    $this->actingAs($otherUser)
        ->put(route('blog.update', $post), [
            'title' => 'New title',
            'description' => 'New description',
        ])
        ->assertForbidden();
});

it('allows the comment author to update their comment', function (): void {
    $user = User::factory()->create();

    $post = Post::query()->create([
        'user_id' => $user->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $comment = $post->comments()->create([
        'user_id' => $user->id,
        'body' => 'Old body',
    ]);

    $this->actingAs($user)
        ->put(route('comments.update', $comment), [
            'body' => 'Updated body',
        ])
        ->assertRedirect(route('blog.index'));

    expect($comment->fresh()->body)->toBe('Updated body');
});

it('prevents other users from updating a comment', function (): void {
    $author = User::factory()->create();
    $otherUser = User::factory()->create();

    $post = Post::query()->create([
        'user_id' => $author->id,
        'title' => 'My first post',
        'description' => 'Hello world',
    ]);

    $comment = $post->comments()->create([
        'user_id' => $author->id,
        'body' => 'Old body',
    ]);

    $this->actingAs($otherUser)
        ->put(route('comments.update', $comment), [
            'body' => 'Updated body',
        ])
        ->assertForbidden();
});
