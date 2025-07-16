using System;
using System.IO;
using Newtonsoft.Json;
using static Program;

class Program
{

    public class Foto
    {
        public string url { get; set; }
        public string urlChica { get; set; }

        public Foto() { }
    }

    public class Plano
    {
        public string url { get; set; }
        public string urlChica { get; set; }

        public Plano() { }
    }

    public class Video
    {
        public string url { get; set; }

        public Video() { }
    }

    public class Oferta
    {
        public string Calle { get; set; }
        public int Altura { get; set; }
        public string Piso { get; set; }
        public string Unidad { get; set; }
        public string TipoPropiedad { get; set; }
        public string SubtipoPropiedad { get; set; }
        public string TipoOperacion { get; set; }
        public string SubtipoOperacion { get; set; }
        public string Moneda { get; set; }
        public string Importe { get; set; }
        public string Codigo { get; set; }
        public int SubCub { get; set; }
        public int SupTot { get; set; }
        public string Destacable { get; set; }
        public string UnidadMedida { get; set; }
        public bool Publica { get; set; }
        public string Provincia { get; set; }
        public string Ubicacion { get; set; }
        public string Latitud { get; set; }
        public string Longitud { get; set; }
        public string Referencia { get; set; }
        public string Pais { get; set; }
        public string Reservada { get; set; }

        [JsonProperty("Atributos")]
        public string AtributosRaw { get; set; }

        [JsonIgnore]
        public string[] Atributos
        {
            get
            {
                if (string.IsNullOrEmpty(AtributosRaw))
                    return new string[0];

                return AtributosRaw
                    .Split(';', StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .ToArray();
            }
        }
        public string UrlFicha { get; set; }
        public int CantidadImagenes { get; set; }
        public string InmobiliariaNombre { get; set; }
        public string InmobiliariaTelefono { get; set; }
        public string InmobiliariaEmail { get; set; }
        public string InmobiliariaWhatsapp { get; set; }
        public List<Foto> fotos { get; set; }
        public List<Plano> planos { get; set; }
        public List<Video> videos { get; set; }
        public string tourVirtual { get; set; }
        public string InformacionReservada { get; set; }
        public string EstadoOferta { get; set; }

        public Oferta() {}
    }


    static async Task Main()
    {
        Console.Write("Ingrese el ID de la oferta: ");

        string idOferta = Console.ReadLine();

        try
        {
            string json = await ObtenerJsonDeApi(idOferta);

            Oferta oferta = JsonConvert.DeserializeObject<Oferta>(json);

            generarHTML(oferta);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);
            Console.ReadLine();
        }


    }

    static async Task<string> ObtenerJsonDeApi(string id)
    {
        string url = $"https://apmovil.som.com.ar/BusquedaServiceV2.aspx?token=ABR325698&codigoInmobiliaria=ABR&codigoSucursal=00&Id={id}";

        using (HttpClient client = new HttpClient())
        {
            client.Timeout = TimeSpan.FromSeconds(10);
            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            string json = await response.Content.ReadAsStringAsync();
            return json;
        }
    }

    static void generarHTML(Oferta oferta)
    {
        string html = @$"<!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset=""UTF-8"">
                            <title>Aber Propiedades</title>
                            <link rel='shortcut icon' type='image/x-icon' href='../favicon.ico?version=1752665049' />
                            <link href=""https://fonts.googleapis.com/icon?family=Material+Icons"" rel=""stylesheet"">
                            <link type=""text/css"" rel=""stylesheet"" href=""../css/materialize.min.css?version=1752665049""  media=""screen,projection""/>
                            <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"">
                            <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
                            <script src=""https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js""></script>
                            <script type=""text/javascript"" src=""../js/scripts.js?version=1752665049""></script>
                            <link href=""https://fonts.googleapis.com/css?family=Raleway:300,400,500,600,700"" rel=""stylesheet""/>
                            <meta property=""og:url""           content=""http://aberpropiedades.com.ar/fichas/departamento-3-ambientes-belgrano.php"" />
                            <meta property=""og:type""          content=""website"" />
                            <meta property=""og:title""         content=""{oferta.TipoPropiedad} - {oferta.SubtipoPropiedad}, {oferta.Ubicacion}, Aber Propiedades"" />
                            <meta property=""og:description""   content=""{oferta.TipoPropiedad} - {oferta.SubtipoPropiedad}, {oferta.Ubicacion}"" />
                            <meta property=""og:image""         content=""http://aberpropiedades.com.ar/fichas/fotos/{oferta.fotos[0].url.Substring(oferta.fotos[0].url.LastIndexOf("/") + 1)}"" />
                          </head>

                          <body>

                          <script type=""text/javascript"">loadheaderFichas();</script>


                          <div class=""container padding"">
  	
	                          <div class=""row col m12 full"">

	  	                        <div class=""row card padding"">
	  		
	  			                        <div id=""datosFicha"" class=""col m6"">
        		                        <table class='tablaDatos'>
 						                        <tbody>
 						                        <tr>
 						                        <td><i class='material-icons blue-grey-text iconos'>home</i></td>
 						                        <td><h5><span id='tipoPropiedad'>{oferta.TipoPropiedad} - {oferta.SubtipoPropiedad}</span></h5></td>
 						                        </tr>
 						                        <tr>
 						                        <td><i class='material-icons blue-grey-text iconos'>place</i></td>
 						                        <td><h6><span id='direccion'>{oferta.Calle} {oferta.Altura} p. {oferta.Piso}, Entre calles: {oferta.Referencia}</span></h6></td>
 						                        </tr>
 						                        <tr>
 						                        <td><i class='material-icons blue-grey-text iconos'>home</i></td>
 						                        <td><h6><span id='ubicacion'>{oferta.Ubicacion} - {oferta.Provincia} - {oferta.Pais}</span></h6></td>
 						                        </tr>
 						                        <tr>
		                                      <td><i class='material-icons blue-grey-text iconos'>crop_free</i></td>
		                                      <td><h6><span id='ubicacion'>Superficie cubierta propia: {oferta.SubCub} m2<br>Superficie total uso propio UF: {oferta.SupTot} m2</span></h6></td>
		                                      </tr>
		                                      <tr>
 						                        <td><i class='material-icons blue-grey-text iconos'>attach_money</i></td>
 						                        <td><h6><span id='operacion'>{oferta.TipoOperacion} - {oferta.Moneda} {oferta.Importe}</span></h6></td>
 						                        </tr>
 						                        <tr>
		                                    <td><i class='material-icons blue-grey-text iconos'>ondemand_video</i></td>
		                                    <td><h6><b><a class='modal-trigger' href='#video'>Ver tour virtual aquí</a></b></h6></td>
		                                    </tr>
 						                        </tbody>
 					                        </table>
    				                        <div class=""col m12 full"">&nbsp;</div>
        	                        </div>

        	                        <div id=""video"" class=""modal"">
                                    <div class=""modal-content"">
                                      <div class=""video-container"">
                                        <iframe width=""853"" height=""480"" src=""//www.youtube.com/embed/Zaf69_N1hC0?rel=0"" frameborder=""0"" allowfullscreen></iframe>
                                      </div>
                                    </div>
                                  </div>

                                <div class=""col m6 blue-grey lighten-4 bordes padding full"">
                                  <div id=""galeria"" class=""galeria"" style=""padding-bottom: 10px;"">
                                      <script type=""text/javascript"">cargarFicha();</script>
                                      <div class=""slider col m12 fotoficha"">
                                        <ul class=""slides fotofichaslide"">";
                                        foreach (var foto in oferta.fotos)
                                        {
                                            {
                                                html += $@"
                                                        <li>
                                                            <img src='fotos/{foto.url.Substring(foto.url.LastIndexOf("/") + 1)}'>
                                                        </li>""";
                                            }
                                        }
                        

                                            foreach (var plano in oferta.planos)
                                            {
                                                {
                                                    html += $@"
                                                            <li>
                                                                <img src='fotos/{plano.url.Substring(plano.url.LastIndexOf("/") + 1)}'>
                                                            </li>""";
                                                }
                                            }

                            html += $@"</ul>
                                      </div>
                                  </div>
                                </div>

                                <div id=""destacable"" class=""col m12 full"">
                                    <h6 class=""blue-text"">Descripción: </h6>
                                        {oferta.Destacable.Replace("\r\n", "<br>").Replace("\n", "<br>").Replace("\r", "<br>")}
                                  </div>

            	                        <div class=""col m12 full"" id=""atributosFicha"">
            		                        <div class=""col m12"" id=""superficies""></div>
	            	                        <div class=""col m12"" id=""atributos""><h6 class=""blue-text"">Atributos: </h6><ul class=""atributos"">";

                                            foreach (var atributo in oferta.Atributos)
                                            {
                                                html += $@"<li>{atributo}</li>";
                                            }

                                            html += $@"</ul>

                                            <br></div>

	            	                        <div class=""col m12"" id=""ambientes""></div>
            	                        </div>

            	                        <div class=""col m12 full"" id=""mapa"">
            		                        <iframe src=""https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.7870496399023!2d-58.40131388477091!3d-34.584254480464466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca9e692d022d%3A0x84d8ab1decb38d2d!2sAustria%202600%2C%20C1425EGT%20CABA!5e0!3m2!1ses-419!2sar!4v1642163275579!5m2!1ses-419!2sar"" width=""100%"" height=""450"" style=""border:0;"" allowfullscreen="""" loading=""lazy""></iframe>
            	                        </div>

                                      <div class=""col m12 full center"">
                                        <h6 class=""blue-text"">Compartir: </h6>
                                        <a class=""share btn blue-grey darken-4"" href='https://api.whatsapp.com/send?text=http://aberpropiedades.com.ar/fichas/departamento-3-dormitorios-recoleta.php' target='_blank'><img class='iconocontacto' src='../img/whatsapp.png'>Compartir</a>&nbsp;
                                        <a class=""share btn blue-grey darken-4"" href='https://www.facebook.com/sharer/sharer.php?u=http://aberpropiedades.com.ar/fichas/departamento-3-dormitorios-recoleta.php' target='_blank'><img class='iconocontacto' src='../img/facebook.png'>Compartir</a>&nbsp;
                                        <a class=""share btn blue-grey darken-4"" href='https://twitter.com/intent/tweet?text=http://aberpropiedades.com.ar/fichas/departamento-3-dormitorios-recoleta.php' target='_blank'><img class='iconocontacto' src='../img/twitter.png'>Compartir</a>&nbsp;
                                        <a class=""share btn blue-grey darken-4"" href=""mailto:?body=http://aberpropiedades.com.ar/fichas/departamento-3-dormitorios-recoleta.php""><i class=""material-icons left"">email</i>Compartir</a>
                                      </div>
            
	  	                        </div>
	  	
	                          </div>
 	
                          </div>

                          <script type=""text/javascript"">loadfooterFichas();</script>

                            <script type=""text/javascript"" src=""../js/materialize.min.js""></script>
                          </body>
                        </html>";

        File.WriteAllText($@"{oferta.TipoPropiedad.Trim().ToLower()}-{oferta.SubtipoPropiedad.Trim().ToLower()}.php", html);
    }
}
