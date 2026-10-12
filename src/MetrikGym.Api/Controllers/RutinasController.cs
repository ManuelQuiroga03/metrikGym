using MetrikGym.Application.DTOs.Rutinas;
using MetrikGym.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MetrikGym.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RutinasController : ControllerBase
{
    private readonly IRutinaService _rutinaService;

    public RutinasController(IRutinaService rutinaService)
    {
        _rutinaService = rutinaService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<RutinaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var rutinas = await _rutinaService.GetRutinasAsync();
        return Ok(rutinas);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(RutinaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var rutina = await _rutinaService.GetByIdAsync(id);
        if (rutina is null) return NotFound(new { message = "Rutina no encontrada." });
        return Ok(rutina);
    }

    [HttpPost]
    [ProducesResponseType(typeof(RutinaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateRutinaDto dto)
    {
        var nueva = await _rutinaService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = nueva.Id }, nueva);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(RutinaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRutinaDto dto)
    {
        var actualizada = await _rutinaService.UpdateAsync(id, dto);
        if (actualizada is null) return NotFound(new { message = "Rutina no encontrada." });
        return Ok(actualizada);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _rutinaService.DeleteAsync(id);
        if (!result) return NotFound(new { message = "Rutina no encontrada." });
        return NoContent();
    }
}
