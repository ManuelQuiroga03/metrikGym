namespace MetrikGym.Application.Common;

public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "MetrikGymAPI";
    public string Audience { get; set; } = "MetrikGymPWA";
    public int ExpiryDays { get; set; } = 30;
}
