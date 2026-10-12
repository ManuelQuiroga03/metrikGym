using MetrikGym.Application.DTOs.Sesiones;
using MetrikGym.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetrikGym.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SesionesController : ControllerBase
{
    private readonly ISesionService _sesionService;

    public SesionesController(ISesionService sesionService)
    {
        _sesionService = sesionService;
    }

    [HttpPost("iniciar")]
    [ProducesResponseType(typeof(SesionEntrenamientoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> IniciarSesion([FromBody] IniciarSesionDto dto)
    {
        try
        {
            var sesion = await _sesionService.IniciarSesionAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = sesion.Id }, sesion);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/finalizar")]
    [ProducesResponseType(typeof(SesionEntrenamientoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> FinalizarSesion(int id, [FromBody] FinalizarSesionDto dto)
    {
        var sesion = await _sesionService.FinalizarSesionAsync(id, dto);
        if (sesion is null) return NotFound(new { message = "Sesión no encontrada." });
        return Ok(sesion);
    }

    [HttpGet("activa")]
    [ProducesResponseType(typeof(SesionEntrenamientoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetActiva()
    {
        var sesion = await _sesionService.GetSesionActivaAsync();
        if (sesion is null) return NoContent();
        return Ok(sesion);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SesionEntrenamientoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var sesion = await _sesionService.GetByIdAsync(id);
        if (sesion is null) return NotFound(new { message = "Sesión no encontrada." });
        return Ok(sesion);
    }

    [HttpGet("historial")]
    [ProducesResponseType(typeof(List<SesionEntrenamientoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHistorial([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var historial = await _sesionService.GetHistorialAsync(page, pageSize);
        return Ok(historial);
    }

    [HttpPost("{sesionId:int}/series")]
    [ProducesResponseType(typeof(SerieRegistroDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarSerie(int sesionId, [FromBody] RegistrarSerieDto dto)
    {
        try
        {
            var serie = await _sesionService.RegistrarSerieAsync(sesionId, dto);
            return Ok(serie);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("series/{serieId:int}")]
    [ProducesResponseType(typeof(SerieRegistroDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSerie(int serieId, [FromBody] UpdateSerieDto dto)
    {
        var serie = await _sesionService.UpdateSerieAsync(serieId, dto);
        if (serie is null) return NotFound(new { message = "Serie no encontrada." });
        return Ok(serie);
    }

    [HttpDelete("series/{serieId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSerie(int serieId)
    {
        var result = await _sesionService.DeleteSerieAsync(serieId);
        if (!result) return NotFound(new { message = "Serie no encontrada." });
        return NoContent();
    }

    [HttpPost("ultimos-registros")]
    [ProducesResponseType(typeof(List<UltimoRegistroEjercicioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUltimosRegistros([FromBody] ConsultarUltimosRegistrosDto dto)
    {
        var ultimos = await _sesionService.GetUltimosRegistrosAsync(dto.EjerciciosIds);
        return Ok(ultimos);
    }

    [HttpPost("sync")]
    [ProducesResponseType(typeof(SesionEntrenamientoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SyncSesion([FromBody] SyncSesionCompletaDto dto)
    {
        try
        {
            var sesion = await _sesionService.SyncSesionCompletaAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = sesion.Id }, sesion);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
