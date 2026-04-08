<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('my_favorite_subject', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('image', 2048);
            $table->text('description');
            $table->string('author');
            $table->unsignedSmallInteger('publication_year');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('my_favorite_subject');
    }
};
