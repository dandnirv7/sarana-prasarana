<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Fetch categories with their associated assets count (for display)
        $categories = Category::withCount('assets')->get();

        // Return the categories to the Inertia view
        return Inertia::render('settings/categories', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created category in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Create a new category
        Category::create($validated);

        // Redirect back to the categories page
        return redirect()->route('categories.index')->with('success', 'Category added successfully!');
    }

    /**
     * Update the specified category in the database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Category $category)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Update the category with the new values
        $category->update($validated);

        // Redirect back to the categories page
        return redirect()->route('categories.index')->with('success', 'Category updated successfully!');
    }

    /**
     * Remove the specified category from the database.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Category $category)
    {
        // Delete the category
        $category->delete();

        // Redirect back to the categories page
        return redirect()->route('categories.index')->with('success', 'Category deleted successfully!');
    }
}
