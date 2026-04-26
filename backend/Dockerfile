# 构建阶段
FROM maven:3.8.8-openjdk-17 as build

# 设置工作目录
WORKDIR /app

# 复制pom.xml文件
COPY pom.xml ./

# 下载依赖
RUN mvn dependency:go-offline

# 复制源代码
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:17-jdk-alpine

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=build /app/target/*.jar app.jar

# 暴露8080端口
EXPOSE 8080

# 启动应用
CMD ["java", "-jar", "app.jar"]
