import { categories } from '../data/mockData';
import { Category } from '../types';
import * as Icons from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="mb-10">
      <h3 className="text-2xl font-bold mb-6 text-white">Categories</h3>
      <div className="flex flex-wrap gap-4">
        {categories.map((category) => {
          const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-2xl scale-105`
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white shadow-lg'
              }`}
            >
              <IconComponent size={22} />
              <span className="text-lg">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};