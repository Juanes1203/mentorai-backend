import bcrypt from 'bcryptjs';
import { query } from '../config/database';

const createUsers = async () => {
  try {
    // Hash de contraseñas
    const passwordHash = await bcrypt.hash('admin123', 10);
    const teacherPasswordHash = await bcrypt.hash('teacher123', 10);
    const adminPasswordHash = await bcrypt.hash('admin456', 10);

    // Insertar usuarios de prueba
    const users = [
      {
        email: 'admin@mentorai.com',
        password_hash: passwordHash,
        name: 'Administrador',
        role: 'admin'
      },
      {
        email: 'maria.gonzalez@mentorai.com',
        password_hash: teacherPasswordHash,
        name: 'Dr. María González',
        role: 'teacher'
      },
      {
        email: 'carlos.rodriguez@mentorai.com',
        password_hash: teacherPasswordHash,
        name: 'Prof. Carlos Rodríguez',
        role: 'teacher'
      },
      {
        email: 'ana.martinez@mentorai.com',
        password_hash: teacherPasswordHash,
        name: 'Lic. Ana Martínez',
        role: 'teacher'
      },
      {
        email: 'superadmin@mentorai.com',
        password_hash: adminPasswordHash,
        name: 'Super Administrador',
        role: 'admin'
      }
    ];

    for (const user of users) {
      // Verificar si el usuario ya existe
      const existingUsers = await query(
        'SELECT id FROM users WHERE email = ?',
        [user.email]
      ) as any[];

      if (existingUsers.length === 0) {
        await query(
          'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
          [user.email, user.password_hash, user.name, user.role]
        );
        console.log(`✅ Usuario creado: ${user.name} (${user.email})`);
      } else {
        console.log(`⚠️ Usuario ya existe: ${user.name} (${user.email})`);
      }
    }

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👤 Admin: admin@mentorai.com / admin123');
    console.log('👨‍🏫 Profesores:');
    console.log('   - maria.gonzalez@mentorai.com / teacher123');
    console.log('   - carlos.rodriguez@mentorai.com / teacher123');
    console.log('   - ana.martinez@mentorai.com / teacher123');
    console.log('👑 Super Admin: superadmin@mentorai.com / admin456');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  }
};

// Ejecutar el script
createUsers(); 