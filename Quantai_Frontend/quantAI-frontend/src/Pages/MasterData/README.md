# Master Data Management Page

## Overview
The Master Data Management page provides administrators with a comprehensive interface to manage system-wide data configurations, categories, and variables.

## Features

### 🔐 Role-based Access Control
- **Admin Only**: This page is restricted to users with Admin role
- **Access Denied**: Non-admin users see an error message and cannot access the page
- **Dynamic Role Checking**: Uses React Context for authentication state management

### 📊 Data Management
- **View**: Display all master data entries in a paginated table
- **Add**: Create new master data entries with a modal form
- **Edit**: Modify existing entries inline
- **Delete**: Remove entries with confirmation dialog
- **Status Toggle**: Activate/deactivate entries

### 🎨 User Interface
- **Consistent Styling**: Follows the same design patterns as other pages
- **Responsive Design**: Works on both desktop and mobile devices
- **Material-UI Components**: Uses MUI components for consistent look and feel
- **Color Scheme**: Matches the application's color palette

## Table Structure

| Column | Description | Type |
|--------|-------------|------|
| ID | Unique identifier | Number |
| Name | Display name | Text |
| Type | Data classification | Dropdown (Category, Variable, Configuration, Reference) |
| Description | Detailed explanation | Textarea |
| Status | Active/Inactive state | Toggle Switch |
| Actions | Edit/Delete buttons | Icon Buttons |

## Form Fields

### Add/Edit Master Data
- **Name** (Required): Text input for the master data name
- **Type** (Required): Dropdown selection for data classification
- **Description**: Multi-line text area for detailed description
- **Status**: Toggle switch for Active/Inactive state

## Usage

### For Administrators
1. Navigate to `/master-data` from the sidebar
2. View existing master data in the table
3. Click "Add Master Data" to create new entries
4. Use Edit/Delete actions on existing entries
5. Toggle status to activate/deactivate entries

### For Non-Administrators
- Access is automatically denied
- Error message is displayed
- User is redirected to appropriate page

## Technical Implementation

### Components Used
- **Table**: Material-UI Table with pagination
- **Dialog**: Modal forms for add/edit operations
- **Form Controls**: TextField, Select, Switch components
- **Notifications**: Snackbar for success/error messages
- **Icons**: Material-UI icons for actions

### State Management
- **Local State**: React useState for component state
- **Authentication**: React Context for user role management
- **Data**: Local state with sample data (replace with API calls)

### Styling
- **Material-UI**: Consistent component styling
- **Custom Colors**: Application-specific color palette
- **Responsive**: Mobile-first design approach

## Future Enhancements

### API Integration
- Replace local state with API calls
- Add real-time data synchronization
- Implement data validation

### Advanced Features
- Bulk operations (import/export)
- Search and filtering
- Data versioning
- Audit logging

### Performance
- Virtual scrolling for large datasets
- Lazy loading
- Caching strategies

## Testing

### Role-based Access
1. Set user role to "User" in AuthContext
2. Navigate to `/master-data`
3. Verify access denied message appears

### CRUD Operations
1. Test adding new master data
2. Test editing existing entries
3. Test deleting entries
4. Test status toggle functionality

### Responsive Design
1. Test on different screen sizes
2. Verify mobile compatibility
3. Check table responsiveness

## Dependencies

- React 18+
- Material-UI (MUI) 5+
- React Router 6+
- React Context API

## File Structure

```
src/Pages/MasterData/
├── MasterDataPage.jsx    # Main component
├── README.md            # This documentation
└── index.js            # Export file (if needed)
```

## Integration Points

- **AppRoutes**: Route configuration
- **AuthContext**: Authentication and authorization
- **Navigation**: Sidebar menu integration
- **Header**: Breadcrumb navigation
