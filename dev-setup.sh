#!/bin/bash

echo "🚀 Configurando MentorAI Backend..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "🔧 Creando archivo .env..."
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor, configura tus variables de entorno."
fi

# Verificar si MySQL está corriendo
echo "🗄️  Verificando conexión a MySQL..."
if ! mysql -u root -p -e "SELECT 1;" > /dev/null 2>&1; then
    echo "⚠️  MySQL no está corriendo o no se puede conectar."
    echo "   Por favor, asegúrate de que MySQL esté instalado y corriendo."
    echo "   También verifica que las credenciales en .env sean correctas."
else
    echo "✅ MySQL está disponible."
fi

echo "✅ Configuración completada!"
echo ""
echo "📋 Para iniciar el desarrollo:"
echo "   npm run dev"
echo ""
echo "🌐 La API estará disponible en: http://localhost:5001"
echo ""
echo "📊 Health check: http://localhost:5001/api/health" 