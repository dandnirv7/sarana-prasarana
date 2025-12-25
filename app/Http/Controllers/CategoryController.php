<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        
        $categories = Category::withCount('assets')->get();

        
        return Inertia::render('settings/categories', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        
        Category::create($validated);

        
        return redirect()->route('categories.index')->with('success', 'Category added successfully!');
    }

    public function update(Request $request, Category $category)
    {
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        
        $category->update($validated);

        
        return redirect()->route('categories.index')->with('success', 'Category updated successfully!');
    }

    public function destroy(Category $category)
    {
        
        $category->delete();

        
        return redirect()->route('categories.index')->with('success', 'Category deleted successfully!');
    }
}
