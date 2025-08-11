-- Script para testar o sistema de permissões
-- Execute após configurar as permissões

-- 1. Verificar se as permissões foram criadas corretamente
SELECT 
    p.id,
    p.action,
    p.resource,
    p.active,
    p.createdAt
FROM `permissions` p
ORDER BY p.resource, p.action;

-- 2. Verificar permissões de um usuário específico (substitua o ID)
SELECT 
    u.name,
    u.email,
    u.role,
    p.resource,
    p.action,
    CONCAT(p.resource, ':', p.action) as permission_string
FROM `users` u
JOIN `user_permissions` up ON u.id = up.userId
JOIN `permissions` p ON up.permissionId = p.id
WHERE u.id = 1  -- Substitua pelo ID do usuário que deseja verificar
ORDER BY p.resource, p.action;

-- 3. Verificar todas as permissões de todos os usuários
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    COUNT(up.permissionId) as total_permissions,
    GROUP_CONCAT(
        CONCAT(p.resource, ':', p.action) 
        ORDER BY p.resource, p.action 
        SEPARATOR ', '
    ) as permissions
FROM `users` u
LEFT JOIN `user_permissions` up ON u.id = up.userId
LEFT JOIN `permissions` p ON up.permissionId = p.id
WHERE u.active = 1
GROUP BY u.id, u.name, u.email, u.role
ORDER BY u.role, u.name;

-- 4. Verificar permissões por role
SELECT 
    u.role,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(up.permissionId) as total_permissions,
    COUNT(up.permissionId) / COUNT(DISTINCT u.id) as avg_permissions_per_user
FROM `users` u
LEFT JOIN `user_permissions` up ON u.id = up.userId
WHERE u.active = 1
GROUP BY u.role;

-- 5. Verificar permissões por recurso
SELECT 
    p.resource,
    p.action,
    COUNT(up.userId) as users_with_permission
FROM `permissions` p
LEFT JOIN `user_permissions` up ON p.id = up.permissionId
LEFT JOIN `users` u ON up.userId = u.id AND u.active = 1
GROUP BY p.resource, p.action
ORDER BY p.resource, p.action;

-- 6. Verificar se há usuários sem permissões
SELECT 
    u.id,
    u.name,
    u.email,
    u.role
FROM `users` u
LEFT JOIN `user_permissions` up ON u.id = up.userId
WHERE u.active = 1 AND up.userId IS NULL;

-- 7. Verificar integridade das permissões
SELECT 
    'Usuários ativos' as check_type,
    COUNT(*) as count
FROM `users` u
WHERE u.active = 1
UNION ALL
SELECT 
    'Permissões disponíveis' as check_type,
    COUNT(*) as count
FROM `permissions` p
WHERE p.active = 1
UNION ALL
SELECT 
    'Relacionamentos user_permissions' as check_type,
    COUNT(*) as count
FROM `user_permissions` up
JOIN `users` u ON up.userId = u.id AND u.active = 1
JOIN `permissions` p ON up.permissionId = p.id AND p.active = 1;
