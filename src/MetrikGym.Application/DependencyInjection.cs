using Microsoft.Extensions.DependencyInjection;

namespace MetrikGym.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Registro de servicios de aplicación, casos de uso, validadores, etc.
        return services;
    }
}
