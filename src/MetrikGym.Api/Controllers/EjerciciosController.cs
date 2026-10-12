using MetrikGym.Application.DTOs.Ejercicios;
using MetrikGym.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetrikGym.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EjerciciosController : ControllerBase
{
    private readonly IEjercicioService _ejercicioService;

    public EjerciciosController(IEjercicioService ejercicioService)
    {
        _ejercicioService = ejercicioService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<EjercicioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] string? grupoMuscular, [FromQuery] string? search)
    {
        var ejercicios = await _ejercicioService.GetEjerciciosAsync(grupoMuscular, search);
        return Ok(ejercicios);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(EjercicioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var ejercicio = await _ejercicioService.GetByIdAsync(id);
        if (ejercicio is null) return NotFound(new { message = "Ejercicio no encontrado." });
        return Ok(ejercicio);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(EjercicioDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateEjercicioDto dto)
    {
        var nuevo = await _ejercicioService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = nuevo.Id }, nuevo);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(EjercicioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEjercicioDto dto)
    {
        try
        {
            var actualizado = await _ejercicioService.UpdateAsync(id, dto);
            if (actualizado is null) return NotFound(new { message = "Ejercicio no encontrado." });
            return Ok(actualizado);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _ejercicioService.DeleteAsync(id);
            if (!result) return NotFound(new { message = "Ejercicio no encontrado." });
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/promover-global")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(EjercicioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> PromoverAGlobal(int id)
    {
        try
        {
            var actualizado = await _ejercicioService.PromoverAGlobalAsync(id);
            if (actualizado is null) return NotFound(new { message = "Ejercicio no encontrado." });
            return Ok(actualizado);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }
}
