// Seed data: all 980 stickers from the FIFA World Cup 2026 Panini album
// Structure: { id, countryCode, number, playerName, category, group }

export type StickerCategory = "special" | "logo" | "player" | "team_photo" | "history" | "coca_cola";

export interface StickerMaster {
  id: string;
  countryCode: string;
  number: number;
  playerName: string;
  category: StickerCategory;
  group: string; // "A", "B", ..., "L", "SPECIAL"
  countryName: string;
}

// Helper to build team stickers (20 per team)
function buildTeamStickers(
  code: string,
  countryName: string,
  group: string,
  players: string[]
): StickerMaster[] {
  const stickers: StickerMaster[] = [];
  // Sticker 1 = Team Logo (FOIL)
  stickers.push({ id: `${code}1`, countryCode: code, number: 1, playerName: "Team Logo", category: "logo", group, countryName });
  // Stickers 2-12 = Players
  for (let i = 2; i <= 12; i++) {
    stickers.push({ id: `${code}${i}`, countryCode: code, number: i, playerName: players[i - 2] || `Jogador ${i}`, category: "player", group, countryName });
  }
  // Sticker 13 = Team Photo
  stickers.push({ id: `${code}13`, countryCode: code, number: 13, playerName: "Team Photo", category: "team_photo", group, countryName });
  // Stickers 14-20 = More Players
  for (let i = 14; i <= 20; i++) {
    stickers.push({ id: `${code}${i}`, countryCode: code, number: i, playerName: players[i - 3] || `Jogador ${i}`, category: "player", group, countryName });
  }
  return stickers;
}

export const ALL_STICKERS: StickerMaster[] = [
  // === SPECIAL / FWC ===
  { id: "FWC1", countryCode: "FWC", number: 1, playerName: "Official Emblem", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },
  { id: "FWC2", countryCode: "FWC", number: 2, playerName: "Official Emblem", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },
  { id: "FWC3", countryCode: "FWC", number: 3, playerName: "Official Mascots", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },
  { id: "FWC4", countryCode: "FWC", number: 4, playerName: "Official Slogan", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },
  { id: "FWC5", countryCode: "FWC", number: 5, playerName: "Official Ball", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },
  { id: "FWC6", countryCode: "FWC", number: 6, playerName: "Canada - Host Country", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },
  { id: "FWC7", countryCode: "FWC", number: 7, playerName: "Mexico - Host Country", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },
  { id: "FWC8", countryCode: "FWC", number: 8, playerName: "USA - Host Country", category: "special", group: "SPECIAL", countryName: "FIFA World Cup" },

  // === GRUPO A ===
  ...buildTeamStickers("MEX", "México", "A", ["Luis Malagón","Johan Vasquez","Jorge Sánchez","Cesar Montes","Jesus Gallardo","Israel Reyes","Diego Lainez","Carlos Rodriguez","Edson Alvarez","Orbelin Pineda","Marcel Ruiz","Érick Sánchez","Hirving Lozano","Santiago Giménez","Raúl Jiménez","Alexis Vega","Roberto Alvarado","Cesar Huerta"]),
  ...buildTeamStickers("RSA", "África do Sul", "A", ["Ronwen Williams","Sipho Chaine","Aubrey Modiba","Samukele Kabini","Mbekezeli Mbokazi","Khulumani Ndamane","Siyabonga Ngezana","Khuliso Mudau","Nkosinathi Sibisi","Teboho Mokoena","Thalente Mbatha","Bathasi Aubaas","Yaya Sithole","Sipho Mbule","Lyle Foster","Iqraam Rayners","Mohau Nkota","Oswin Appollis"]),
  ...buildTeamStickers("KOR", "Coreia do Sul", "A", ["Hyeon-woo Jo","Seung-Gyu Kim","Min-jae Kim","Yu-min Cho","Young-woo Seol","Han-beom Lee","Tae-seok Lee","Myung-jae Lee","Jae-sung Lee","In-beom Hwang","Kang-in Lee","Seung-ho Paik","Jens Castrop","Dong-yeong Lee","Gue-sung Cho","Heung-min Son","Hee-chan Hwang","Hyeon-Gyu Oh"]),
  ...buildTeamStickers("CZE", "Rep. Tcheca", "A", ["Matej Kovar","Jindrich Stanek","Ladislav Krejci","Vladimir Coufal","Jaroslav Zeleny","Tomas Holes","David Zima","Michal Sadilek","Lukas Provod","Lukas Cerv","Tomas Soucek","Pavel Sulc","Matej Vydra","Vasil Kusej","Tomas Chory","Vaclav Cerny","Adam Hlozek","Patrik Schick"]),

  // === GRUPO B ===
  ...buildTeamStickers("CAN", "Canadá", "B", ["Dayne St.Clair","Alphonso Davies","Alistair Johnston","Samuel Adekugbe","Riche Larvea","Derek Cornelius","Moïse Bombito","Kamal Miller","Stephen Eustáquio","Ismaël Koné","Jonathan Osorio","Jacob Shaffelburg","Mathieu Choinière","Niko Sigur","Tajon Buchanan","Liam Millar","Cyle Larin","Jonathan David"]),
  ...buildTeamStickers("BIH", "Bósnia", "B", ["Nikola Vasilj","Amer Dedic","Sead Kolasinac","Tarik Muharemovic","Nihad Mujakic","Nikola Katic","Amir Hadziahmetovic","Benjamin Tahirovic","Armin Gigovic","Ivan Sunjic","Ivan Basic","Dzenis Burnic","Esmir Bajraktarevic","Amar Memic","Ermedin Demirovic","Edin Dzeko","Samed Bazdar","Haris Tabakovic"]),
  ...buildTeamStickers("QAT", "Catar", "B", ["Meshaal Barsham","Sultan Albrake","Lucas Mendes","Homam Ahmed","Boualem Khoukhi","Pedro Miguel","Tarek Salman","Mohamed Al-Mannai","Karim Boudiaf","Assim Madibo","Ahmed Fatehi","Mohammed Waad","Abdulaziz Hatem","Hassan Al-Haydos","Edmilson Junior","Akram Hassan Afif","Ahmed Al Ganehi","Almoez Ali"]),
  ...buildTeamStickers("SUI", "Suíça", "B", ["Gregor Kobel","Yvon Mvogo","Manuel Akanji","Ricardo Rodriguez","Nico Elvedi","Aurèle Amenda","Silvan Widmer","Granit Xhaka","Denis Zakaria","Remo Freuler","Fabian Rieder","Ardon Jashari","Johan Manzambi","Michel Aebischer","Breel Embolo","Ruben Vargas","Dan Ndoye","Zeki Amdouni"]),

  // === GRUPO C ===
  ...buildTeamStickers("BRA", "Brasil", "C", ["Alisson","Bento","Marquinhos","Éder Militão","Gabriel Magalhães","Danilo","Wesley","Lucas Paquetá","Casemiro","Bruno Guimarães","Luiz Henrique","Vinicius Júnior","Rodrygo","João Pedro","Matheus Cunha","Gabriel Martinelli","Raphinha","Estévão"]),
  ...buildTeamStickers("MAR", "Marrocos", "C", ["Yassine Bounou","Munir El Kajoui","Achraf Hakimi","Noussair Mazraoui","Nayef Aguerd","Roman Saiss","Jawad El Yamio","Adam Masina","Sofyan Amrabat","Azzedine Ounahi","Eliesse Ben Seghir","Bilal El Khannouss","Ismael Saibari","Youssef En-Nesyri","Abde Ezzalzouli","Soufiane Rahimi","Brahim Diaz","Ayoub El Kaabi"]),
  ...buildTeamStickers("HAI", "Haiti", "C", ["Johny Placide","Carlens Arcus","Martin Expérience","Jean-Kevin Duverne","Ricardo Adé","Duke Lacroix","Garven Metusala","Hannes Delcroix","Leverton Pierre","Danley Jean Jacques","Jean-Ricner Bellegarde","Christopher Attys","Derrick Etienne Jr","Josue Casimir","Ruben Providence","Duckens Nazon","Louicius Deedson","Frantzdy Pierrot"]),
  ...buildTeamStickers("SCO", "Escócia", "C", ["Angus Gunn","Jack Hendry","Kieran Tierney","Aaron Hickey","Andrew Robertson","Scott McKenna","John Souttar","Anthony Ralston","Grant Hanley","Scott McTominay","Billy Gilmour","Lewis Ferguson","Ryan Christie","Kenny McLean","John McGinn","Lyndon Dykes","Che Adams","Ben Gannon-Doak"]),

  // === GRUPO D ===
  ...buildTeamStickers("USA", "Estados Unidos", "D", ["Matt Freese","Chris Richards","Tim Ream","Mark McKenzie","Alex Freeman","Antonee Robinson","Tyler Adams","Tanner Tessmann","Weston McKennie","Christian Roldan","Timothy Weah","Diego Luna","Malik Tillman","Christian Pulisic","Brenden Aaronson","Ricardo Pepi","Haji Wright","Folarin Balogun"]),
  ...buildTeamStickers("PAR", "Paraguai", "D", ["Roberto Fernandez","Orlando Gill","Gustavo Gomez","Fabián Balbuena","Juan José Cáceres","Omar Alderete","Junior Alonso","Mathías Villasanti","Diego Gomez","Damián Bobadilla","Andres Cubas","Matias Galarza Fonda","Julio Enciso","Alejandro Romero Gamarra","Miguel Almirón","Ramon Sosa","Angel Romero","Antonio Sanabria"]),
  ...buildTeamStickers("AUS", "Austrália", "D", ["Mathew Ryan","Joe Gauci","Harry Souttar","Alessandro Circati","Jordan Bos","Aziz Behich","Cameron Burgess","Lewis Miller","Milos Degenek","Jackson Irvine","Riley McGree","Aiden O'Neill","Connor Metcalfe","Patrick Yazbek","Craig Goodwin","Kusini Vengi","Nestory Irankunda","Mohamed Touré"]),
  ...buildTeamStickers("TUR", "Turquia", "D", ["Ugurcan Cakir","Mert Muldur","Zeki Celik","Abdulkerim Bardakci","Caglar Soyuncu","Merih Demiral","Ferdi Kadioglu","Kaan Ayhan","Ismail Yuksek","Hakan Calhanoglu","Orkun Kokcu","Arda Guler","Irfan Can Kahveci","Yunus Akgun","Can Uzun","Baris Alper Yilmaz","Kerem Akturkoglu","Kenan Yildiz"]),

  // === GRUPO E ===
  ...buildTeamStickers("GER", "Alemanha", "E", ["Marc-André ter Stegen","Oliver Baumann","Antonio Rüdiger","Benjamin Henrichs","Nico Schlotterbeck","Robin Koch","David Raum","Toni Kroos","Ilkay Gündogan","Joshua Kimmich","Florian Wirtz","Leroy Sané","Jamal Musiala","Kai Havertz","Thomas Müller","Niclas Füllkrug","Deniz Undav","Chris Führich"]),
  ...buildTeamStickers("CUW", "Curaçao", "E", ["Eloy Room","Cuco Martina","Ethan Doostnazeer","Jurien Gaari","Rangelo Janga","Leandro Bacuna","Gevaro Nepomuceno","Gilson Tavares","Quentin Bonga","Jarchinio Antonia","Chedric Bazoer","Dion Malone","Myron Boadu","Gio Fränkel","Roshon van Eijma","Juninho","Ricky van Wolfswinkel","Elson Hooi"]),
  ...buildTeamStickers("CIV", "Costa do Marfim", "E", ["Yahia Fofana","Badra Ali Sangaré","Serge Aurier","Wilfried Singo","Odilon Kossounou","Eric Bailly","Franck Kessié","Jean-Michaël Seri","Ibrahim Sangaré","Seko Fofana","Maxwel Cornet","Sébastien Haller","Nicolas Pépé","Wilfried Zaha","Jonathan Bamba","Oumar Diakité","Simon Adingra","Karim Konaté"]),
  ...buildTeamStickers("ECU", "Equador", "E", ["Hernán Galíndez","Alexander Domínguez","Piero Hincapié","Robert Arboleda","Félix Torres","Angelo Preciado","Diego Palacios","Moisés Caicedo","Jhegson Méndez","Carlos Gruezo","Romario Ibarra","Gonzalo Plata","Pervis Estupiñán","Jeremy Sarmiento","Enner Valencia","Michael Estrada","Djorkaeff Reasco","Kendry Páez"]),

  // === GRUPO F ===
  ...buildTeamStickers("NED", "Holanda", "F", ["Bart Verbruggen","Remko Pasveer","Virgil van Dijk","Matthijs de Ligt","Nathan Aké","Denzel Dumfries","Daley Blind","Frenkie de Jong","Tijjani Reijnders","Teun Koopmeiners","Xavi Simons","Cody Gakpo","Donyell Malen","Memphis Depay","Steven Bergwijn","Wout Weghorst","Brian Brobbey","Jeremie Frimpong"]),
  ...buildTeamStickers("JPN", "Japão", "F", ["Shuichi Gonda","Daniel Schmidt","Maya Yoshida","Ko Itakura","Takehiro Tomiyasu","Yuto Nagatomo","Hiroki Ito","Wataru Endo","Hidemasa Morita","Junya Ito","Takumi Minamino","Ritsu Doan","Kaoru Mitoma","Daichi Kamada","Ayase Ueda","Keito Nakamura","Takefusa Kubo","Ao Tanaka"]),
  ...buildTeamStickers("SWE", "Suécia", "F", ["Robin Olsen","Karl-Johan Johnsson","Victor Lindelöf","Isak Hien","Ludwig Augustinsson","Mikael Lustig","Emil Krafth","Albin Ekdal","Dejan Kulusevski","Viktor Claesson","Emil Forsberg","Jesper Karlsson","Alexander Isak","Robin Quaison","Jordan Larsson","Zlatan Ibrahimovic","Anthony Elanga","Mattias Svanberg"]),
  ...buildTeamStickers("TUN", "Tunísia", "F", ["Aymen Dahmen","Bechir Ben Said","Montassar Talbi","Dylan Bronn","Yassine Meriah","Ali Maaloul","Nader Ghandri","Ellyes Skhiri","Anis Ben Slimane","Wahbi Khazri","Hannibal Mejbri","Naim Sliti","Sayfallah Ltaief","Issam Jebali","Seifeddine Jaziri","Youssef Msakni","Mohamed Drager","Ghaylen Chaalali"]),

  // === GRUPO G ===
  ...buildTeamStickers("BEL", "Bélgica", "G", ["Koen Casteels","Simon Mignolet","Toby Alderweireld","Jan Vertonghen","Thomas Meunier","Timothy Castagne","Axel Witsel","Kevin De Bruyne","Youri Tielemans","Leandro Trossard","Dries Mertens","Romelu Lukaku","Eden Hazard","Lois Openda","Charles De Ketelaere","Jeremy Doku","Arthur Vermeeren","Amadou Onana"]),
  ...buildTeamStickers("EGY", "Egito", "G", ["Mohamed El-Shenawy","Ahmed El-Shenawy","Ahmed Hegazy","Omar Kamal","Ayman Ashraf","Mohamed Abdel-Moneim","Mahmoud Hamdy","Amr El-Sulaya","Tarek Hamed","Emam Ashour","Hamdi Fathi","Mohamed Salah","Mostafa Mohamed","Marwan Hamdy","Omar Marmoush","Mahmoud Trezeguet","Zizo","Akram Tawfik"]),
  ...buildTeamStickers("IRN", "Irã", "G", ["Alireza Beiranvand","Hossein Hosseini","Ramin Rezaeian","Shoja Khalilzadeh","Majid Hosseini","Sadegh Moharrami","Ehsan Hajsafi","Saeid Ezatolahi","Ahmad Noorollahi","Ali Gholizadeh","Sardar Azmoun","Mehdi Taremi","Karim Ansarifard","Allahyar Sayyadmanesh","Saman Ghoddos","Milad Sarlak","Vahid Amiri","Morteza Pouraliganji"]),
  ...buildTeamStickers("NZL", "Nova Zelândia", "G", ["Stefan Marinovic","Michael Woud","Winston Reid","Bill Tuiloma","Liberato Cacace","Nando Pijnaker","Elijah Just","Clayton Lewis","Marko Stamenic","Callum McCowatt","Chris Wood","Sarpreet Singh","Kosta Barbarouses","Myer Bevan","Liam Millar","Dane Ingham","Joe Bell","Matthew Garbett"]),

  // === GRUPO H ===
  ...buildTeamStickers("ESP", "Espanha", "H", ["Unai Simón","David Raya","Dani Carvajal","Aymeric Laporte","Pau Cubarsí","Alejandro Grimaldo","Rodri","Pedri","Fabián Ruiz","Gavi","Lamine Yamal","Ferran Torres","Álvaro Morata","Mikel Oyarzabal","Nico Williams","Dani Olmo","Joselu","Ansu Fati"]),
  ...buildTeamStickers("CPV", "Cabo Verde", "H", ["Vozinha","Marcelo","Roberto Lopes","Stopira","Steven Fortes","Diney","Ryan Mendes","Jamiro Monteiro","Kenny Rocha","Patrick Andrade","Garry Rodrigues","Hélio Varela","Jovane Cabral","Julio Tavares","Djaniny","Willy Semedo","Lisandro Semedo","Bryan Teixeira"]),
  ...buildTeamStickers("KSA", "Arábia Saudita", "H", ["Mohammed Al-Owais","Nawaf Al-Aqidi","Ali Al-Bulayhi","Hassan Tambakti","Abdulelah Al-Amri","Sultan Al-Ghanam","Sami Al-Najei","Abdulellah Al-Malki","Salman Al-Faraj","Mohamed Kanno","Firas Al-Buraikan","Salem Al-Dawsari","Hattan Bahebri","Abdullah Al-Hamdan","Saud Abdulhamid","Riyadh Sharahili","Nasser Al-Dawsari","Yasser Al-Shahrani"]),
  ...buildTeamStickers("URU", "Uruguai", "H", ["Fernando Muslera","Sergio Rochet","Diego Godín","José María Giménez","Mathías Olivera","Guillermo Varela","Federico Valverde","Rodrigo Bentancur","Lucas Torreira","Matías Vecino","Giorgian De Arrascaeta","Darwin Núñez","Luis Suárez","Edinson Cavani","Facundo Torres","Maxi Gómez","Brian Rodríguez","Nicolás De La Cruz"]),

  // === GRUPO I ===
  ...buildTeamStickers("FRA", "França", "I", ["Mike Maignan","Alphonse Areola","Benjamin Pavard","Raphaël Varane","Dayot Upamecano","Theo Hernandez","Lucas Hernandez","Aurélien Tchouaméni","Eduardo Camavinga","Adrien Rabiot","Antoine Griezmann","Kylian Mbappé","Olivier Giroud","Ousmane Dembélé","Marcus Thuram","Randal Kolo Muani","Kingsley Coman","Mattéo Guendouzi"]),
  ...buildTeamStickers("SEN", "Senegal", "I", ["Édouard Mendy","Alfred Gomis","Kalidou Koulibaly","Abdou Diallo","Youssouf Sabaly","Formose Mendy","Nampalys Mendy","Idrissa Gueye","Pape Matar Sarr","Cheikhou Kouyaté","Sadio Mané","Ismaïla Sarr","Boulaye Dia","Nicolas Jackson","Habib Diallo","Lamine Camara","Iliman Ndiaye","Krepin Diatta"]),
  ...buildTeamStickers("IRQ", "Iraque", "I", ["Jalal Hassan","Dhurgham Ismail","Ali Adnan","Rebin Sulaka","Saad Natiq","Amjed Attwan","Bashar Resan","Osama Rashid","Aymen Hussein","Mohanad Ali","Alaa Abbas","Mohanad Lateef","Mazin Faisal","Karrar Mohammed","Ahmed Yasin","Muhannad Abdul Raheem","Ibrahim Bayesh","Emad Mohammed"]),
  ...buildTeamStickers("NOR", "Noruega", "I", ["Ørjan Nyland","Rune Jarstein","Leo Skiri Østigård","Andreas Hanche-Olsen","Birger Meling","Stian Gregersen","Mohamed Elyounoussi","Martin Ødegaard","Sander Berge","Kristian Thorstvedt","Erling Haaland","Alexander Sørloth","Ola Solbakken","Antonio Nusa","Jens Petter Hauge","Fredrik Aursnes","Patrick Berg","Mathias Normann"]),

  // === GRUPO J ===
  ...buildTeamStickers("ARG", "Argentina", "J", ["Emiliano Martínez","Franco Armani","Cristian Romero","Lisandro Martínez","Nicolás Otamendi","Nahuel Molina","Marcos Acuña","Rodrigo De Paul","Leandro Paredes","Alexis Mac Allister","Enzo Fernández","Lionel Messi","Lautaro Martínez","Julián Álvarez","Paulo Dybala","Nicolás González","Ángel Di María","Giovani Lo Celso"]),
  ...buildTeamStickers("ALG", "Argélia", "J", ["Raïs M'Bolhi","Alexandre Oukidja","Ramy Bensebaini","Djamel Benlamri","Aïssa Mandi","Hossem Aouar","Sofiane Feghouli","Ismaël Bennacer","Nabil Bentaleb","Youcef Atal","Riyad Mahrez","Islam Slimani","Baghdad Bounedjah","Yacine Brahimi","Andy Delort","Billal Brahimi","Farès Chaïbi","Mohamed Amine Amoura"]),
  ...buildTeamStickers("AUT", "Áustria", "J", ["Patrick Pentz","Daniel Bachmann","David Alaba","Philipp Lienhart","Stefan Posch","Maximilian Wöber","Florian Grillitsch","Konrad Laimer","Marcel Sabitzer","Christoph Baumgartner","Nicolas Seiwald","Michael Gregoritsch","Marko Arnautovic","Sasa Kalajdzic","Patrick Wimmer","Romano Schmid","Florian Kainz","Xaver Schlager"]),
  ...buildTeamStickers("JOR", "Jordânia", "J", ["Yazeed Abo Laila","Amer Shafi","Yazan Al-Naimat","Baha' Faisal","Abdallah Nasib","Ehsan Haddad","Mahmoud Almardi","Musa Al-Taamari","Yazan Al-Arab","Noor Al-Rawabdeh","Hamza Al-Dardour","Mousa Suleiman","Zaid Al-Hamdan","Yousef Al-Rawashdeh","Salam Al-Aqrabawi","Obada Al-Aqrabawi","Mahmoud Al-Mardi","Ahmad Saleh"]),

  // === GRUPO K ===
  ...buildTeamStickers("POR", "Portugal", "K", ["Diogo Costa","Rui Patrício","Rúben Dias","Pepe","Nuno Mendes","João Cancelo","Bernardo Silva","Bruno Fernandes","Vitinha","João Palhinha","Otávio","Cristiano Ronaldo","Rafael Leão","Gonçalo Ramos","João Félix","Diogo Jota","André Silva","Rúben Neves"]),
  ...buildTeamStickers("COD", "Congo", "K", ["Ley Matampi","Joël Kiassumbua","Chancel Mbemba","Glody Ngonda","Marcel Tisserand","Arthur Masuaku","Yoane Wissa","Cédric Bakambu","Neeskens Kebano","Silas Mvumpa","Théo Bongonda","Dodi Lukebakio","Meschak Elia","Fiston Mayele","Britt Assombalonga","Bongani Zungu","Gaël Kakuta","Firmin Mubele"]),
  ...buildTeamStickers("UZB", "Uzbequistão", "K", ["Eldorbek Smatov","Jasur Yakhshiboev","Sherzod Nasrullayev","Akbar Tursunov","Khurshid Beknazarov","Jaloliddin Masharipov","Odil Ahmedov","Dostonbek Khamdamov","Eldor Shomurodov","Otabek Shukurov","Abbosbek Fayzullaev","Laziz Azimov","Bobur Abdixoliqov","Jasurbek Yakhshiboev","Khojiakbar Alijonov","Dilshod Yo'ldoshev","Umid Yo'ldoshev","Sanjar Tursunov"]),
  ...buildTeamStickers("COL", "Colômbia", "K", ["Camilo Vargas","David Ospina","Davinson Sánchez","Yerry Mina","William Tesillo","Stefan Medina","Wilmar Barrios","Mateus Uribe","Juan Cuadrado","James Rodríguez","Luis Díaz","Rafael Santos Borré","Falcao García","Duván Zapata","Jhon Córdoba","Cucho Hernández","Jhon Jáder Durán","Sebastián Villa"]),

  // === GRUPO L ===
  ...buildTeamStickers("ENG", "Inglaterra", "L", ["Jordan Pickford","Nick Pope","Kyle Walker","John Stones","Harry Maguire","Luke Shaw","Declan Rice","Jude Bellingham","Phil Foden","Bukayo Saka","Raheem Sterling","Harry Kane","Marcus Rashford","Jack Grealish","Trent Alexander-Arnold","Kalvin Phillips","Mason Mount","Ollie Watkins"]),
  ...buildTeamStickers("CRO", "Croácia", "L", ["Dominik Livaković","Ivica Ivušić","Josip Šutalo","Joško Gvardiol","Duje Ćaleta-Car","Borna Sosa","Mateo Kovačić","Luka Modrić","Marcelo Brozović","Ivan Perišić","Andrej Kramarić","Nikola Vlašić","Bruno Petković","Marko Livaja","Josip Stanišić","Lovro Majer","Luka Ivanušec","Martin Erlić"]),
  ...buildTeamStickers("GHA", "Gana", "L", ["Lawrence Ati-Zigi","Jojo Wollacott","Daniel Amartey","Alexander Djiku","Tariq Lamptey","Andy Yiadom","Thomas Partey","Baba Rahman","Mubarak Wakaso","Daniel-Kofi Kyereh","Jordan Ayew","André Ayew","Mohammed Kudus","Inaki Williams","Antoine Semenyo","Osman Bukari","Kamaldeen Sulemana","Ransford Yeboah"]),
  ...buildTeamStickers("PAN", "Panamá", "L", ["Luis Mejía","Orlando Mosquera","Fidel Escobar","Eric Davis","Andrés Andrade","Adalberto Carrasquilla","César Yanis","Édgar Bárcenas","Rolando Blackburn","Abdiel Arroyo","Ismael Díaz","José Fajardo","Roderick Miller","Cecilio Waterman","Alfredo Stephens","Gabriel Torres","Aníbal Godoy","Freddy Góndola"]),

  // === HISTÓRIA DA COPA ===
  { id: "FWC9", countryCode: "FWC", number: 9, playerName: "História da Copa 1930", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC10", countryCode: "FWC", number: 10, playerName: "História da Copa 1934", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC11", countryCode: "FWC", number: 11, playerName: "História da Copa 1938", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC12", countryCode: "FWC", number: 12, playerName: "História da Copa 1950", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC13", countryCode: "FWC", number: 13, playerName: "História da Copa 1954", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC14", countryCode: "FWC", number: 14, playerName: "História da Copa 1958", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC15", countryCode: "FWC", number: 15, playerName: "História da Copa 1962", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC16", countryCode: "FWC", number: 16, playerName: "História da Copa 1966", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC17", countryCode: "FWC", number: 17, playerName: "História da Copa 1970", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC18", countryCode: "FWC", number: 18, playerName: "História da Copa 1974", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },
  { id: "FWC19", countryCode: "FWC", number: 19, playerName: "História da Copa 1978", category: "history", group: "SPECIAL", countryName: "FIFA World Cup History" },

  // === COLEÇÃO COCA-COLA ===
  { id: "CC1", countryCode: "CC", number: 1, playerName: "Coca-Cola 1", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC2", countryCode: "CC", number: 2, playerName: "Coca-Cola 2", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC3", countryCode: "CC", number: 3, playerName: "Coca-Cola 3", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC4", countryCode: "CC", number: 4, playerName: "Coca-Cola 4", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC5", countryCode: "CC", number: 5, playerName: "Coca-Cola 5", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC6", countryCode: "CC", number: 6, playerName: "Coca-Cola 6", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC7", countryCode: "CC", number: 7, playerName: "Coca-Cola 7", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC8", countryCode: "CC", number: 8, playerName: "Coca-Cola 8", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC9", countryCode: "CC", number: 9, playerName: "Coca-Cola 9", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC10", countryCode: "CC", number: 10, playerName: "Coca-Cola 10", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
  { id: "CC11", countryCode: "CC", number: 11, playerName: "Coca-Cola 11", category: "coca_cola", group: "SPECIAL", countryName: "Coleção Coca-Cola" },
];

// Lookup map for fast access
export const STICKER_MAP: Record<string, StickerMaster> = {};
ALL_STICKERS.forEach((s) => { STICKER_MAP[s.id.toUpperCase()] = s; });

// All valid country codes
export const COUNTRY_CODES = [
  "MEX","RSA","KOR","CZE","CAN","BIH","QAT","SUI",
  "BRA","MAR","HAI","SCO","USA","PAR","AUS","TUR",
  "GER","CUW","CIV","ECU","NED","JPN","SWE","TUN",
  "BEL","EGY","IRN","NZL","ESP","CPV","KSA","URU",
  "FRA","SEN","IRQ","NOR","ARG","ALG","AUT","JOR",
  "POR","COD","UZB","COL","ENG","CRO","GHA","PAN",
  "FWC","CC"
];

export const COUNTRY_NAMES: Record<string, string> = {
  MEX: "México", RSA: "África do Sul", KOR: "Coreia do Sul", CZE: "Rep. Tcheca",
  CAN: "Canadá", BIH: "Bósnia", QAT: "Catar", SUI: "Suíça",
  BRA: "Brasil", MAR: "Marrocos", HAI: "Haiti", SCO: "Escócia",
  USA: "Estados Unidos", PAR: "Paraguai", AUS: "Austrália", TUR: "Turquia",
  GER: "Alemanha", CUW: "Curaçao", CIV: "Costa do Marfim", ECU: "Equador",
  NED: "Holanda", JPN: "Japão", SWE: "Suécia", TUN: "Tunísia",
  BEL: "Bélgica", EGY: "Egito", IRN: "Irã", NZL: "Nova Zelândia",
  ESP: "Espanha", CPV: "Cabo Verde", KSA: "Arábia Saudita", URU: "Uruguai",
  FRA: "França", SEN: "Senegal", IRQ: "Iraque", NOR: "Noruega",
  ARG: "Argentina", ALG: "Argélia", AUT: "Áustria", JOR: "Jordânia",
  POR: "Portugal", COD: "Congo", UZB: "Uzbequistão", COL: "Colômbia",
  ENG: "Inglaterra", CRO: "Croácia", GHA: "Gana", PAN: "Panamá",
  FWC: "FIFA World Cup", CC: "Coca-Cola",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  MEX: "🇲🇽", RSA: "🇿🇦", KOR: "🇰🇷", CZE: "🇨🇿",
  CAN: "🇨🇦", BIH: "🇧🇦", QAT: "🇶🇦", SUI: "🇨🇭",
  BRA: "🇧🇷", MAR: "🇲🇦", HAI: "🇭🇹", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA: "🇺🇸", PAR: "🇵🇾", AUS: "🇦🇺", TUR: "🇹🇷",
  GER: "🇩🇪", CUW: "🇨🇼", CIV: "🇨🇮", ECU: "🇪🇨",
  NED: "🇳🇱", JPN: "🇯🇵", SWE: "🇸🇪", TUN: "🇹🇳",
  BEL: "🇧🇪", EGY: "🇪🇬", IRN: "🇮🇷", NZL: "🇳🇿",
  ESP: "🇪🇸", CPV: "🇨🇻", KSA: "🇸🇦", URU: "🇺🇾",
  FRA: "🇫🇷", SEN: "🇸🇳", IRQ: "🇮🇶", NOR: "🇳🇴",
  ARG: "🇦🇷", ALG: "🇩🇿", AUT: "🇦🇹", JOR: "🇯🇴",
  POR: "🇵🇹", COD: "🇨🇩", UZB: "🇺🇿", COL: "🇨🇴",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", CRO: "🇭🇷", GHA: "🇬🇭", PAN: "🇵🇦",
  FWC: "🏆", CC: "🥤",
};

export const GROUP_TEAMS: Record<string, string[]> = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "IRQ", "NOR"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"],
  SPECIAL: ["FWC", "CC"],
};
