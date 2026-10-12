using MetrikGym.Application.DTOs.Auth;
using MetrikGym.Application.DTOs.Ejercicios;
using MetrikGym.Application.DTOs.Rutinas;
using MetrikGym.Application.DTOs.Sesiones;

namespace MetrikGym.Application.Interfaces;

public interface ICurrentUserService
{
    int? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}

public interface IJwtProvider
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(int userId, string email, string nombre, string rol);
}

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<UserProfileDto?> GetProfileAsync(int userId);
}

public interface IEjercicioService
{
    Task<List<EjercicioDto>> GetEjerciciosAsync(string? grupoMuscular = null, string? search = null);
    Task<EjercicioDto?> GetByIdAsync(int id);
    Task<EjercicioDto> CreateAsync(CreateEjercicioDto dto);
    Task<EjercicioDto?> UpdateAsync(int id, UpdateEjercicioDto dto);
    Task<bool> DeleteAsync(int id);
    Task<EjercicioDto?> PromoverAGlobalAsync(int id);
}

public interface IRutinaService
{
    Task<List<RutinaDto>> GetRutinasAsync();
    Task<RutinaDto?> GetByIdAsync(int id);
    Task<RutinaDto> CreateAsync(CreateRutinaDto dto);
    Task<RutinaDto?> UpdateAsync(int id, UpdateRutinaDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ISesionService
{
    Task<SesionEntrenamientoDto> IniciarSesionAsync(IniciarSesionDto dto);
    Task<SesionEntrenamientoDto?> FinalizarSesionAsync(int sesionId, FinalizarSesionDto dto);
    Task<SesionEntrenamientoDto?> GetSesionActivaAsync();
    Task<SesionEntrenamientoDto?> GetByIdAsync(int id);
    Task<List<SesionEntrenamientoDto>> GetHistorialAsync(int page = 1, int pageSize = 20);
    Task<SerieRegistroDto> RegistrarSerieAsync(int sesionId, RegistrarSerieDto dto);
    Task<SerieRegistroDto?> UpdateSerieAsync(int serieId, UpdateSerieDto dto);
    Task<bool> DeleteSerieAsync(int serieId);
    Task<List<UltimoRegistroEjercicioDto>> GetUltimosRegistrosAsync(List<int> ejerciciosIds);
    Task<SesionEntrenamientoDto> SyncSesionCompletaAsync(SyncSesionCompletaDto dto);
}
