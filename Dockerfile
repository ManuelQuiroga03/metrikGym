# Base build stage con .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar archivos de proyecto para restaurar dependencias y aprovechar cache
COPY ["src/MetrikGym.Domain/MetrikGym.Domain.csproj", "src/MetrikGym.Domain/"]
COPY ["src/MetrikGym.Application/MetrikGym.Application.csproj", "src/MetrikGym.Application/"]
COPY ["src/MetrikGym.Infrastructure/MetrikGym.Infrastructure.csproj", "src/MetrikGym.Infrastructure/"]
COPY ["src/MetrikGym.Api/MetrikGym.Api.csproj", "src/MetrikGym.Api/"]

RUN dotnet restore "src/MetrikGym.Api/MetrikGym.Api.csproj"

# Copiar todo el código fuente
COPY . .

# Compilar y publicar binarios optimizados
WORKDIR "/src/src/MetrikGym.Api"
RUN dotnet publish "MetrikGym.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime final ultraligero
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render asigna el puerto mediante la variable de entorno PORT
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "MetrikGym.Api.dll"]
