# Portal de equipo — Tablero de notas
 
Aplicación web para que un equipo consulte su actividad, administre sus usuarios y organice notas en un tablero compartido.

## Stack utilizado
 
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Prisma
- **Base de datos:** PostgreSQL
- **Métricas del dashboard:** AWS Lambda (ejecutable en local con AWS SAM)
- **Contenedores:** Docker + Docker Compose
- **Infraestructura como código:** AWS SAM (Lambda) + AWS CloudFormation (EC2, S3, CloudFront)

# Cuentas de demostración

*  Administrador | adminprueba@demo.com      | 12345
*  Usuario       | userprueba@demo.com       | 12345      
 
Estas cuentas se crean automatica al lavantar el proyecto.

**Cómo puede iniciar sesión un usuario creado desde la aplicación:** cualquier usuario nuevo creado por un administrador desde la pantalla "Usuarios" puede iniciar sesión de inmediato en la pantalla de login, usando el correo y la contraseña que el administrador le asignó al crearlo.

# Requisitos previos

- Docker y Docker Compose
- AWS SAM CLI (para ejecutar la función Lambda del dashboard en local)

Todo corre dentro de contenedores, solo se necesita docker para la simulación de la Lambda.

# Levantar el proyecto en local

Se necesitan dos partes por separado:

### 1. Levantar la aplicación principal (frontend + backend + base de datos)

```bash
docker compose up --build
```

Esto levanta:
- **PostgreSQL** en el puerto `5434`
- **Backend (API)** en `http://localhost:4000`
- **Frontend** en `http://localhost:8080`
Al arrancar, el backend sincroniza automáticamente el esquema de la base de datos y siembra las cuentas de demostración (usando `upsert`, por lo que es seguro reiniciar sin duplicar datos).

### 2. Levantar la función Lambda del dashboard (en otra terminal, en paralelo)
 
```bash
sam build
sam local start-api --env-vars env.local.json
```
 
Esto simula el entorno de AWS Lambda + API Gateway en `http://localhost:3000`. El backend (dentro de Docker) se conecta a esta Lambda a través de `host.docker.internal`.

### 3. Usar la aplicación
 
Abre `http://localhost:8080` e inicia sesión con cualquiera de las cuentas demo de la tabla de arriba.
 
## Persistencia de datos
 
Los datos de PostgreSQL se guardan en un volumen de Docker (`db_data`), por lo que **sobreviven a reinicios del contenedor** (`docker compose down` seguido de `docker compose up` conserva los datos). Para partir desde cero completamente, hay que eliminar el volumen explícitamente:
 
```bash
docker compose down -v
```

# Arquitectura

 - El **frontend** solo se comunica con la API — nunca directamente con la base de datos ni con la Lambda.
- La **API** es responsable de autenticación (JWT), autorización por rol, y el CRUD de usuarios y notas vía Prisma.
- El cálculo de las métricas del dashboard se delega completamente a una **función Lambda**, que la API consulta por HTTP. La API actúa como intermediaria; el frontend nunca llama a la Lambda directamente.

## Arquitectura de despliegue en AWS (infraestructura como código)
 
La aplicación está preparada para desplegarse en AWS con el siguiente diseño:
 
- **EC2:** ejecuta la API dentro de un contenedor Docker.
- **Lambda:** calcula y entrega las métricas del dashboard (plantilla en `template.yaml`, gestionada con AWS SAM).
- **S3 + CloudFront:** almacenan y distribuyen el build estático del frontend, con el bucket S3 bloqueado al público y accesible únicamente a través de CloudFront (usando Origin Access Control).
Las plantillas de infraestructura como código están en:
- `template.yaml` — AWS SAM, define la función Lambda de métricas.
- `infra/aws-architecture.yaml` — AWS CloudFormation, define EC2, S3 y CloudFront.

## Cómo desplegar (opcional, no ejecutado en esta entrega)
 
**Lambda (con SAM):**
 
```bash
sam build
sam deploy --guided
```
 
Se te pedirá el parámetro `DatabaseUrl` (la cadena de conexión a una base de datos Postgres accesible desde AWS, por ejemplo Amazon RDS).
 
**EC2, S3, CloudFront (con CloudFormation):**
 
```bash
aws cloudformation deploy \
  --template-file infra/aws-architecture.yaml \
  --stack-name team-portal-infra \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    VpcId=<tu-vpc-id> \
    SubnetId=<tu-subnet-id> \
    KeyPairName=<tu-key-pair> \
    DatabaseUrl=<tu-cadena-de-conexion> \
    JwtSecret=<tu-secreto-jwt>
```
 
### Cómo retirar los recursos desplegados
 
```bash
aws cloudformation delete-stack --stack-name team-portal-infra
sam delete
```
 
## Tiempo empleado
 
Aproximadamente **11 horas** en total (por encima del límite sugerido de 8 horas), principalmente por tiempo adicional invertido en depuración de entorno: incompatibilidad de Prisma con versiones recientes de Node.js, configuración de AWS SAM CLI, y ajustes de compatibilidad de Docker (versión de Node para el build del frontend, compilación nativa de `bcrypt`).

## Limitaciones y pendientes conocidos
 
- No se realizó un despliegue real en AWS — las plantillas de SAM y CloudFormation están completas y listas, pero no se ejecutaron contra una cuenta de AWS.

- No se implementó notificación visual de "guardado exitoso" en las notas del tablero (no requerido por el enunciado).

- No se implementó validación de complejidad de contraseñas (longitud mínima, caracteres especiales, etc.) — se acepta cualquier contraseña, lo cual sería una debilidad de seguridad en un entorno de producción real.

- Eliminar una nota o desactivar un usuario ocurre de inmediato al hacer clic, sin un diálogo de "¿Estás seguro?" — una mejora de UX pendiente para evitar borrados accidentales.

**Versión entregada:** Último commit del repositorio en la rama main al momento de esta entrega.



