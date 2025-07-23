<!-- markdownlint-disable -->
# Flexible Role-Based Access Control (RBAC) Design

## 🎯 **Design Goals**

✅ **Maximum Flexibility** - Users can join/leave organizations dynamically  
✅ **Multi-Tenancy** - Support multiple schools/programs on one platform  
✅ **Cross-Organization Monitoring** - Observers can monitor learners across schools  
✅ **Solo User Support** - Users can start solo and join organizations later  
✅ **Scalable Architecture** - Clean separation of concerns and efficient queries  

## 🏗️ **Core Architecture**

### **1. Multi-Tenant Foundation**

```
Platform Level (SaaS)
├── Multiple Organizations (Schools/Programs)
│   ├── Users with Organization-Specific Roles
│   └── Cross-Organization Observer Relationships
└── Solo Users (Not yet in any organization)
```

### **2. Role Hierarchy**

| Role | Level | Permissions |
|------|-------|-------------|
| `platform_admin` | SaaS Platform | Full platform access, manage all organizations |
| `school_admin` | Organization | Manage their organization, users, and roles |
| `staff` | Organization | Administrative tasks within organization |
| `teacher` | Organization | Teach classes, view assigned students |
| `learner` | Organization | Access learning materials, submit work |
| `observer` | Cross-Org | Monitor specific learners (parents/guardians) |

## 📊 **Database Schema Overview**

### **Core Tables**

#### **`user_profiles`** - Extended User Information
- Extends Supabase `auth.users`
- Platform admin flag
- Personal information and preferences

#### **`organizations`** - Schools, Programs, Institutions
- Multi-type support (school, program, district, etc.)
- Flexible settings and branding
- Auto-join via email domains

#### **`user_organization_roles`** - Dynamic Role Assignments
- **Many-to-Many** relationship with role context
- Users can have **different roles** in **different organizations**
- Supports **role changes** and **temporary memberships**

#### **`observer_relationships`** - Flexible Monitoring
- **Cross-organization** observer-learner relationships
- Fine-grained permissions (grades, attendance, progress)
- Supports **multiple observers** per learner

#### **`organization_invitations`** - Secure Joining
- Token-based invitation system
- Role-specific invitations
- Expiration and tracking

## 🔄 **Flexible User Journeys**

### **Solo User → Organization Member**
```sql
-- 1. User signs up (solo)
INSERT INTO user_profiles (id, email, first_name, last_name)
VALUES (auth.uid(), 'user@example.com', 'John', 'Doe');

-- 2. Later joins a school as a teacher
INSERT INTO user_organization_roles (user_id, organization_id, role)
VALUES (auth.uid(), 'school-uuid', 'teacher');
```

### **Multi-School Teacher**
```sql
-- Teacher joins multiple schools
INSERT INTO user_organization_roles (user_id, organization_id, role) VALUES
(auth.uid(), 'school-a-uuid', 'teacher'),
(auth.uid(), 'school-b-uuid', 'teacher'),
(auth.uid(), 'program-c-uuid', 'staff');
```

### **Cross-School Observer**
```sql
-- Parent monitoring children in different schools
INSERT INTO observer_relationships (observer_id, learner_id, organization_id) VALUES
(auth.uid(), 'child1-uuid', 'elementary-school-uuid'),
(auth.uid(), 'child2-uuid', 'high-school-uuid');
```

## 🔐 **Security & Row Level Security**

### **Multi-Layered Security**
1. **Supabase Auth** - Authentication and JWT tokens
2. **Row Level Security** - Database-level authorization
3. **Role-Based Policies** - Context-aware permissions
4. **API-Level Validation** - Application-layer checks

### **Key Security Functions**
```sql
-- Check if user has specific role in organization
SELECT has_org_role('org-uuid', 'teacher');

-- Check if user can access learner data
SELECT can_access_learner('learner-uuid');

-- Get all user's roles across organizations
SELECT * FROM get_user_roles(auth.uid());
```

## 🚀 **Implementation Benefits**

### **✅ Ultra Flexible**
- Users can be in **0, 1, or many** organizations
- **Different roles** in different contexts
- **Dynamic role changes** without data migration

### **✅ Scalable Multi-Tenancy**
- **Organization isolation** by default
- **Cross-organization features** when needed
- **Efficient queries** with proper indexing

### **✅ Real-World Scenarios Supported**

#### **Scenario 1: Substitute Teacher**
```sql
-- Temporarily add substitute teacher to school
INSERT INTO user_organization_roles (user_id, organization_id, role, expires_at)
VALUES ('substitute-uuid', 'school-uuid', 'teacher', '2024-12-31');
```

#### **Scenario 2: Student Transfers Schools**
```sql
-- Deactivate old school role
UPDATE user_organization_roles 
SET is_active = FALSE, left_at = NOW()
WHERE user_id = 'student-uuid' AND organization_id = 'old-school-uuid';

-- Add new school role
INSERT INTO user_organization_roles (user_id, organization_id, role)
VALUES ('student-uuid', 'new-school-uuid', 'learner');
```

#### **Scenario 3: Multi-School District Admin**
```sql
-- Admin manages multiple schools in district
INSERT INTO user_organization_roles (user_id, organization_id, role) VALUES
('admin-uuid', 'district-uuid', 'school_admin'),
('admin-uuid', 'school1-uuid', 'school_admin'),
('admin-uuid', 'school2-uuid', 'school_admin');
```

## 📋 **API Design Patterns**

### **Context-Aware Queries**
```typescript
// Get user's organizations and roles
const getUserOrganizations = async (userId: string) => {
  const { data } = await supabase
    .from('user_organization_roles')
    .select(`
      role,
      is_active,
      organization:organizations(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true);
  
  return data;
};

// Get learners observable by current user
const getObservableLearners = async () => {
  const { data } = await supabase
    .rpc('get_observable_learners', { observer_uuid: auth.user.id });
  
  return data;
};
```

### **Role Checking Middleware**
```typescript
const requireRole = (requiredRole: UserRole, orgId?: string) => {
  return async (req, res, next) => {
    const hasRole = await supabase
      .rpc('has_org_role', { 
        org_id: orgId, 
        required_role: requiredRole 
      });
    
    if (hasRole.data) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
```

## 🔄 **Migration & Evolution**

### **Adding New Roles**
```sql
-- Add new role type
ALTER TYPE user_role ADD VALUE 'coordinator';

-- Update policies to include new role
-- No data migration needed!
```

### **Adding Organization Features**
```sql
-- Add new organization settings
ALTER TABLE organizations 
ADD COLUMN grading_system JSONB DEFAULT '{}',
ADD COLUMN academic_calendar JSONB DEFAULT '{}';
```

## 🎯 **Next Steps**

1. **Implement Core Services** - User, Organization, Role management
2. **Add Authentication Flows** - Invitation acceptance, role switching
3. **Build Admin Dashboards** - Organization management, user oversight
4. **Add Observer Features** - Progress monitoring, notifications
5. **Extend with Classes/Courses** - Link roles to specific classes
6. **Add Reporting** - Cross-organization analytics for observers

This design gives you **maximum flexibility** while maintaining **security** and **performance**. Users can move freely between organizations, have multiple roles, and the system scales beautifully! 🚀
