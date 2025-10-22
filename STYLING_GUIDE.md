# 🎨 AI Study Assistant - Complete Styling Guide

## 📋 **Overview**
This guide provides all the styling patterns, components, and design tokens needed to match your reference design exactly.

## 🛠️ **Technology Stack**

### ✅ **Recommended: Tailwind CSS** (Already configured)
- **Why**: Perfect match for your design system
- **Benefits**: Utility-first, consistent spacing, easy maintenance
- **Usage**: Direct className application + custom component classes

### 🔧 **Alternative Options**
- **Styled Components**: For component-scoped styling
- **Emotion**: For CSS-in-JS with great performance
- **CSS Modules**: For scoped styling without runtime

## 🎯 **Design System Tokens**

### **Colors (Based on Your Reference)**
```tsx
// Primary Colors
const colors = {
  // Sidebar & Navigation
  sidebar: {
    bg: '#1a1a1a',          // Dark sidebar background
    text: '#ffffff',         // White text
    textSecondary: '#a0a0a0', // Gray text
    active: '#2563eb',       // Blue active state
    hover: '#2a2a2a'         // Dark hover
  },
  
  // Subject Color Coding
  subjects: {
    science: { bg: '#dcfce7', text: '#166534' },    // Green
    math: { bg: '#dbeafe', text: '#1e40af' },       // Blue  
    art: { bg: '#fce7f3', text: '#be185d' },        // Pink
    language: { bg: '#f3e8ff', text: '#7c3aed' },   // Purple
    tech: { bg: '#fef3c7', text: '#d97706' },       // Yellow
    physics: { bg: '#e0e7ff', text: '#4338ca' },    // Indigo
    chemistry: { bg: '#ecfdf5', text: '#059669' },  // Emerald
    history: { bg: '#fef2f2', text: '#dc2626' }     // Red
  },
  
  // Status Colors
  status: {
    online: '#10b981',    // Green
    offline: '#6b7280',   // Gray
    away: '#f59e0b',      // Yellow
    active: '#3b82f6'     // Blue
  },
  
  // Grade Colors
  grades: {
    excellent: '#10b981', // A grades - Green
    good: '#3b82f6',      // B grades - Blue  
    average: '#f59e0b',   // C grades - Orange
    poor: '#ef4444'       // D/F grades - Red
  }
}
```

### **Typography Scale**
```tsx
const typography = {
  // Headings
  h1: 'text-2xl font-bold text-gray-900',      // Main page titles
  h2: 'text-xl font-semibold text-gray-900',   // Section titles
  h3: 'text-lg font-semibold text-gray-900',   // Card titles
  
  // Body Text
  body: 'text-sm text-gray-700',               // Main content
  caption: 'text-xs text-gray-500',            // Small text
  label: 'text-sm font-medium text-gray-600',  // Form labels
  
  // Special
  grade: 'text-lg font-bold',                  // Grade numbers
  badge: 'text-xs font-medium'                 // Badge text
}
```

### **Spacing & Layout**
```tsx
const spacing = {
  // Card Padding
  cardPadding: 'p-6',           // Standard card padding
  cardMargin: 'mb-6',           // Card spacing
  
  // Grid Systems
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  grid3: 'grid grid-cols-1 lg:grid-cols-3 gap-6', 
  grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Container
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  mainContent: 'md:pl-64 pt-16'  // Account for sidebar
}
```

## 🧩 **Component Patterns**

### **1. Card Components**
```tsx
// Basic Card
<div className="ai-card">
  <div className="ai-card-header">
    <h3 className="ai-card-title">Card Title</h3>
  </div>
  <div className="space-y-4">
    {/* Card content */}
  </div>
</div>

// Hover Effect Card
<div className="ai-card ai-hover-lift">
  {/* Content */}
</div>
```

### **2. Subject Badges**
```tsx
// Science Badge
<span className="ai-badge ai-badge-science">Science</span>

// Math Badge  
<span className="ai-badge ai-badge-math">Mathematics</span>

// Status Badge
<span className="ai-badge ai-badge-active">Active</span>
<span className="ai-badge ai-badge-offline">Offline</span>
```

### **3. Avatar with Status**
```tsx
// Student/Teacher Avatar
<div className="ai-avatar">
  <div className="ai-avatar-circle bg-blue-100">
    <span className="text-2xl">👨‍🎓</span>
  </div>
  <div className="ai-status-online"></div>
</div>

// Large Avatar (for profiles)
<div className="ai-avatar">
  <div className="ai-avatar-large bg-gradient-to-br from-blue-400 to-purple-500">
    <span className="text-white text-3xl">👩‍🏫</span>
  </div>
</div>
```

### **4. Progress Bars**
```tsx
// Subject Progress
<div className="space-y-2">
  <div className="flex justify-between">
    <span className="text-sm font-medium">Mathematics</span>
    <span className="text-sm text-gray-500">85%</span>
  </div>
  <div className="ai-progress-container">
    <div className="ai-progress-high" style={{width: '85%'}}></div>
  </div>
</div>
```

### **5. Grade Display**
```tsx
// Grade with Icon
<div className="flex items-center space-x-2">
  <span className="ai-grade-excellent">93 (A)</span>
  <span className="text-lg">🏆</span>
</div>

// Grade Table Cell
<td className="ai-table-cell text-center">
  <div className="flex items-center justify-center space-x-2">
    <span className="ai-grade-good">88 (B)</span>
    <span className="text-lg">⭐</span>
  </div>
</td>
```

### **6. Navigation Items**
```tsx
// Active Navigation
<Link href="/overview" className="ai-nav-active">
  <span className="mr-3 text-lg">📊</span>
  Overview
</Link>

// Inactive Navigation
<Link href="/notes" className="ai-nav-inactive">
  <span className="mr-3 text-lg">📝</span>
  Notes
</Link>
```

### **7. Button Variations**
```tsx
// Primary Button
<button className="ai-button-primary">
  Ask AI Assistant
</button>

// Secondary Button
<button className="ai-button-secondary">
  View Details
</button>

// Small Action Button
<button className="ai-button ai-button-small ai-button-success">
  🤖 AI Summary
</button>
```

### **8. Calendar/Schedule Events**
```tsx
// Calendar Event
<div className="ai-event-science">
  <div className="font-medium">Science Basics</div>
  <div>Class 300</div>
  <div>11 AM</div>
</div>

// Math Event
<div className="ai-event-math">
  <div className="font-medium">Calculus</div>
  <div>2 PM</div>
</div>
```

## 🎭 **Special Effects & Animations**

### **Hover Effects**
```tsx
// Lift on Hover
<div className="ai-hover-lift">
  {/* Content */}
</div>

// Scale on Hover
<div className="ai-hover-scale">
  {/* Content */}
</div>
```

### **Gradient Backgrounds**
```tsx
// AI Assistant Panel
<div className="ai-gradient-success rounded-lg p-4 text-white">
  <h3>🤖 AI Study Assistant</h3>
</div>

// Primary Gradient
<div className="ai-gradient-primary rounded-lg p-6 text-white">
  {/* Content */}
</div>
```

### **Glass Effect (Modern Look)**
```tsx
<div className="ai-glass-effect rounded-lg p-6">
  {/* Glassmorphism content */}
</div>
```

## 📱 **Responsive Patterns**

### **Mobile-First Grid**
```tsx
// Responsive Teacher Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {teachers.map(teacher => (
    <div key={teacher.id} className="ai-card ai-hover-lift">
      {/* Teacher card content */}
    </div>
  ))}
</div>
```

### **Responsive Text**
```tsx
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
  Dashboard
</h1>
```

## 🔄 **Animation Classes**

### **Entrance Animations**
```tsx
// Fade in from bottom
<div className="ai-fade-in">
  {/* Content */}
</div>

// Bounce in effect
<div className="ai-bounce-in">
  {/* Content */}
</div>
```

## 📊 **Data Visualization Styling**

### **Chart Bars (for grades/progress)**
```tsx
// Subject Progress Chart
<div className="h-64 bg-gray-50 rounded-lg flex items-end justify-center p-4 space-x-4">
  <div className="flex flex-col items-center space-y-2">
    <div className="bg-blue-500 h-20 w-12 rounded-t flex items-end justify-center pb-2">
      <span className="text-white text-xs font-bold">85%</span>
    </div>
    <span className="text-xs text-gray-600">Math</span>
  </div>
  {/* More bars */}
</div>
```

## 🎨 **Example Implementation**

Here's how to apply these styles to create a component matching your reference:

```tsx
// Teacher Card Component
export function TeacherCard({ teacher }) {
  return (
    <div className="ai-card ai-hover-lift">
      {/* Subject Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {teacher.subjects.map(subject => (
          <span key={subject} className={`ai-badge ai-badge-${getSubjectColor(subject)}`}>
            {subject}
          </span>
        ))}
      </div>

      {/* Teacher Info */}
      <div className="text-center mb-4">
        <div className="ai-avatar mx-auto mb-3">
          <div className={`ai-avatar-large ${teacher.bgColor}`}>
            <span className="text-3xl">{teacher.avatar}</span>
          </div>
        </div>
        <h3 className="ai-card-title">{teacher.name}</h3>
        <p className="text-sm text-gray-600">{teacher.email}</p>
      </div>

      {/* Stats */}
      <div className="flex justify-center space-x-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-medium ml-1">{teacher.rating}</span>
          </div>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
        <div className="text-center">
          <span className="text-sm font-medium">{teacher.students}</span>
          <div className="text-xs text-gray-500">Students</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-2">
        <button className="ai-button ai-button-small ai-button-secondary">📧</button>
        <button className="ai-button ai-button-small ai-button-secondary">📞</button>
      </div>
    </div>
  )
}
```

## 🚀 **Quick Start Checklist**

- ✅ Tailwind CSS configured
- ✅ Custom classes added to globals.css
- ✅ Color tokens defined
- ✅ Component patterns documented
- ✅ Responsive breakpoints set
- ✅ Animation classes ready

## 💡 **Pro Tips**

1. **Consistent Spacing**: Use the spacing scale consistently
2. **Color Coding**: Each subject has its own color throughout the app
3. **Hover States**: Add subtle interactions to improve UX
4. **Animation**: Use sparingly for professional feel
5. **Responsive**: Always test on mobile first

This styling system will give you the exact look and feel of your reference design! 🎨✨