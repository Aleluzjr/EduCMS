-- Criar tabela de permissões
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` enum('read','write','delete','manage') NOT NULL,
  `resource` enum('users','documents','templates','media','system') NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_permission` (`action`, `resource`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de relacionamento user_permissions
CREATE TABLE IF NOT EXISTS `user_permissions` (
  `userId` int NOT NULL,
  `permissionId` int NOT NULL,
  PRIMARY KEY (`userId`, `permissionId`),
  KEY `fk_user_permissions_user` (`userId`),
  KEY `fk_user_permissions_permission` (`permissionId`),
  CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_permissions_permission` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir permissões padrão
INSERT IGNORE INTO `permissions` (`action`, `resource`) VALUES
-- Permissões para usuários
('read', 'users'),
('write', 'users'),
('delete', 'users'),
('manage', 'users'),

-- Permissões para documentos
('read', 'documents'),
('write', 'documents'),
('delete', 'documents'),
('manage', 'documents'),

-- Permissões para templates
('read', 'templates'),
('write', 'templates'),
('delete', 'templates'),
('manage', 'templates'),

-- Permissões para mídia
('read', 'media'),
('write', 'media'),
('delete', 'media'),
('manage', 'media'),

-- Permissões para sistema
('read', 'system'),
('write', 'system'),
('delete', 'system'),
('manage', 'system');
