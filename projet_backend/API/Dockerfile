FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY API/API.csproj API/
COPY Context/Context.csproj Context/
COPY Entities/Entities.csproj Entities/
COPY projet_backend.Tests/projet_backend.Tests.csproj projet_backend.Tests/

RUN dotnet restore API/API.csproj

COPY . .

RUN dotnet publish API/API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "API.dll"]

