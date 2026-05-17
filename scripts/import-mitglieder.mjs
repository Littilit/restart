/**
 * Import Bestandsmitglieder Cryopoint Augsburg
 * Quelle: Google-Sheets-Export (HTML), Stand Mai 2025
 *
 * Ausführen (lokal Dev):
 *   DATABASE_URL=postgresql://dev:devpassword@localhost:5432/dev node scripts/import-mitglieder.mjs
 *
 * Ausführen (Prod-Container via docker exec):
 *   node /app/scripts/import-mitglieder.mjs
 *
 * Datenbankpfad und Encoding wurden manuell bereinigt.
 * 5 Einträge ohne E-Mail werden übersprungen (geloggt).
 * Script ist idempotent (Duplikat-Check via email+vorname+nachname).
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dotenv = await import('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

// Datenqualitäts-Anmerkungen aus der Quelle:
// - Stahl/Andreas, Zielbauer/Diana: Vorname+Nachname vertauscht → korrigiert
// - Philippe The Long Hegglin: ungewöhnlicher Vorname, so übernommen
// - Settele Daniela: PLZ 861447 vermutlich 86447 (Aindlingen) → so gelassen, bitte prüfen
// - Kurtagic Samir + Adisa: gleiche E-Mail krimask@hotmail.com → beide importiert
// - 5 Einträge ohne E-Mail übersprungen: Haßmüller, Lawrence, Mesch Lisa, Stahl Lukas, Schütz Anna
const mitglieder = [
  { vorname: 'Franziska', nachname: 'Abert', geburtsdatum: '30.04.1996', telefon: '', adresse: 'Friedrich-Sohnle-Straße 8, 86163 Augsburg', email: 'f.abert@gmx.net' },
  // Vorname/Nachname in Quelle vertauscht → korrigiert
  { vorname: 'Andreas', nachname: 'Stahl', geburtsdatum: '31.01.1972', telefon: '+491778996699', adresse: 'Keltenweg 15, 86497 Horgau', email: 'andreas@galasport.de' },
  { vorname: 'Wolfgang', nachname: 'Appelt', geburtsdatum: '27.01.1959', telefon: '+491634202076', adresse: 'Sperberweg 1, 86399 Bobingen', email: 'mw.appelt@t-online.de' },
  { vorname: 'Monika', nachname: 'Appelt', geburtsdatum: '24.05.1958', telefon: '017644243300', adresse: 'Sperberweg 1, 86399 Bobingen', email: 'monika.appelt@web.de' },
  { vorname: 'Kerim', nachname: 'Atalay', geburtsdatum: '10.04.1994', telefon: '017631660254', adresse: 'Bahnhofstr 54, 86368 Gersthofen', email: 'atalay.kerim@hotmail.de' },
  { vorname: 'Lebibe', nachname: 'Baftija', geburtsdatum: '02.10.1986', telefon: '+4917634197707', adresse: 'Narzissenstrasse 2a, 86179 Augsburg', email: 'lebibbaf.96@gmail.com' },
  { vorname: 'Sibel', nachname: 'Bargu', geburtsdatum: '10.02.1973', telefon: '+4917684815474', adresse: 'Schwibbogenplatz 2a, 86153 Augsburg', email: 'sibelbargu2@gmail.com' },
  { vorname: 'Christian', nachname: 'Bathke', geburtsdatum: '04.10.1978', telefon: '+491739994032', adresse: 'Kurt-Viermetz-Str. 4, 86150 Augsburg', email: 'c.bathke@me.com' },
  { vorname: 'Melanie', nachname: 'Becker', geburtsdatum: '03.08.1986', telefon: '+491725929094', adresse: 'Münchner Straße 32, 86316 Friedberg', email: 'elke3886@gmail.com' },
  { vorname: 'Alois', nachname: 'Belavic', geburtsdatum: '01.05.1986', telefon: '+4917637478202', adresse: 'Römerstraße 25, 86368 Gersthofen', email: 'aloisbelavic@freenet.de' },
  { vorname: 'Tomislava', nachname: 'Benic', geburtsdatum: '08.10.1997', telefon: '017631541214', adresse: 'Schellingstr. 27, 86167 Augsburg', email: 'benic.tomislava@gmail.com' },
  { vorname: 'Robert', nachname: 'Blattenberger', geburtsdatum: '22.07.1958', telefon: '+491757295490', adresse: 'Bgm. Widemann Str. 2, 82278 Althegnenberg', email: 'robert.blattenberger@t-online.de' },
  { vorname: 'Ilona', nachname: 'Blessing', geburtsdatum: '30.08.1977', telefon: '+4915163734852', adresse: 'Kreppenstraße 6 F, 86356 Steppach', email: 'ilona_blessing@web.de' },
  { vorname: 'Frank', nachname: 'Bobrich', geburtsdatum: '13.10.1962', telefon: '+491715095914', adresse: 'Zettlerstraße 7 E, 86415 Mering', email: 'fbobrich@arcor.de' },
  { vorname: 'Dagmar', nachname: 'Böck', geburtsdatum: '14.10.1962', telefon: '01721359914', adresse: 'Am Schäfflerbach 1a, 86153 Augsburg', email: 'dagmar.boeck@gmx.de' },
  { vorname: 'Erwin', nachname: 'Brandl', geburtsdatum: '28.04.1959', telefon: '+491735730059', adresse: 'Reinöhlstraße 97C, 86156 Augsburg', email: 'ebrandl@cseb-augsburg.net' },
  { vorname: 'Alexander', nachname: 'Buchta', geburtsdatum: '29.01.1978', telefon: '+4917621230230', adresse: 'Königsseestraße 19 A, 86163 Augsburg', email: 'alexbuchta@mail.de' },
  { vorname: 'Kai', nachname: 'Bükers', geburtsdatum: '24.12.1990', telefon: '+4915775857224', adresse: 'Rupprechtstraße 15, 86157 Augsburg', email: 'kaibuekers@yahoo.de' },
  { vorname: 'Thalia', nachname: 'Castillo', geburtsdatum: '27.08.1992', telefon: '+491725276933', adresse: 'Metzgplatz 2, 86150 Augsburg', email: 'thali_castillo@hotmail.com' },
  { vorname: 'Andrea', nachname: 'Dankwardt', geburtsdatum: '22.03.1964', telefon: '+4917680054137', adresse: 'Ortlerstraße 67, 86163 Augsburg', email: 'dankwardt@gmx.de' },
  // Vorname/Nachname in Quelle vertauscht → korrigiert
  { vorname: 'Diana', nachname: 'Zielbauer', geburtsdatum: '01.01.1972', telefon: '+4915257401488', adresse: 'Seilerstraße 4, 86153 Augsburg', email: 'dianahaller99@gmail.com' },
  { vorname: 'Ana Sofia', nachname: 'Dias Goncalves Scholz', geburtsdatum: '29.06.1979', telefon: '', adresse: 'Reischlestr. 38, 86153 Augsburg', email: 'anascholz@gmx.de' },
  { vorname: 'André', nachname: 'Dornach', geburtsdatum: '26.07.1989', telefon: '015117876412', adresse: 'Lilienthalstrasse 21, 86159 Augsburg', email: 'andre.dornach@freenet.de' },
  { vorname: 'Mark', nachname: 'Draycott', geburtsdatum: '14.02.1967', telefon: '01751421967', adresse: 'Fritz-wendel-Straße 6, 86159 Augsburg', email: 'info@meisterparkett.de' },
  { vorname: 'Rene', nachname: 'Drechsel', geburtsdatum: '03.06.1983', telefon: '+4915256294710', adresse: 'Xanderhof 4, 86511 Schmiechen', email: 'rdrechsel@outlook.com' },
  { vorname: 'Helga', nachname: 'Ehrlich', geburtsdatum: '06.01.1985', telefon: '+4917643864504', adresse: 'Bauernfeindstraße 9, 86159 Augsburg', email: 'ehrlichhelga@t-online.de' },
  { vorname: 'Emine', nachname: 'Elmas', geburtsdatum: '06.08.1981', telefon: '01602198169', adresse: 'Carl-Schurz-Straße 14 A, 86156 Augsburg', email: 'eminemohnem81@outlook.de' },
  { vorname: 'Harald', nachname: 'Eulert', geburtsdatum: '30.12.1980', telefon: '+491709485951', adresse: 'Thomstraße 28, 86153 Augsburg', email: 'harryeulert@googlemail.com' },
  { vorname: 'Eugen', nachname: 'Fahn', geburtsdatum: '18.08.1977', telefon: '017657666398', adresse: 'Donauwörther Str. 12a, 86343 Königsbrunn', email: 'vilena@live.de' },
  { vorname: 'Letizia', nachname: 'Federico', geburtsdatum: '01.10.1978', telefon: '+491724153458', adresse: 'Lauterlech 49, 86152 Augsburg', email: 'letiziafederico21@gmail.com' },
  { vorname: 'Fabian', nachname: 'Fellenberg', geburtsdatum: '10.01.1994', telefon: '+4915562691150', adresse: 'Christoph-von-Schmid-Straße 19, 86470 Thannhausen', email: 'fips10@freenet.de' },
  { vorname: 'Peter', nachname: 'Frodl', geburtsdatum: '29.03.1961', telefon: '+4917614373476', adresse: 'Kolpingstraße 3, 86316 Friedberg', email: 'peter.frodl@web.de' },
  { vorname: 'Erika', nachname: 'Fronterra', geburtsdatum: '22.02.1980', telefon: '017621794475', adresse: 'Kaffeeberg 32, 86456 Gablingen', email: 'erikabarabas@web.de' },
  { vorname: 'Peter', nachname: 'Fronterra', geburtsdatum: '28.02.1982', telefon: '017610367348', adresse: 'Kaffeeberg 32, 86456 Gablingen', email: 'peter@ultimategym.de' },
  { vorname: 'Dietmar', nachname: 'Gäbelein', geburtsdatum: '16.07.1964', telefon: '017656768988', adresse: 'Kirschenweg 17, 86169 Augsburg', email: 'dietmar.gaebelein@icloud.com' },
  { vorname: 'Max', nachname: 'Gerber', geburtsdatum: '06.12.1992', telefon: '017670836621', adresse: 'Zum Fuggerschloss 1, 86199 Augsburg', email: 'max@max-gerber.com' },
  { vorname: 'Martina', nachname: 'Glück', geburtsdatum: '11.03.1983', telefon: '01621756959', adresse: 'Alfred-Wainald-Weg 8, 86169 Augsburg', email: 'm.glueck@mail.de' },
  { vorname: 'Johannes', nachname: 'Groß', geburtsdatum: '23.07.1999', telefon: '015174300379', adresse: 'Carron-Du-val-str. 16 d, 86161 Augsburg', email: 'joma_gross@gmx.de' },
  { vorname: 'Tülay', nachname: 'Gündogan', geburtsdatum: '15.03.1970', telefon: '+491749791770', adresse: 'Von Parseval-Straße 44, 86159 Augsburg', email: 'guendogant@hotmail.com' },
  { vorname: 'Katharina', nachname: 'Haberkorn', geburtsdatum: '08.08.1985', telefon: '', adresse: 'Jakoberstrasse 42, 86152 Augsburg', email: 'kathabp@icloud.com' },
  { vorname: 'Hannah', nachname: 'Hallweger', geburtsdatum: '08.09.2001', telefon: '+491607111133', adresse: 'Frohsinnstraße 8, 86150 Augsburg', email: 'hannah.hallweger@gmail.com' },
  { vorname: 'Varaidzo', nachname: 'Harper', geburtsdatum: '25.03.1977', telefon: '', adresse: 'Zeuggasse 1a, 86150 Augsburg', email: 'vee.harper@yahoo.co.uk' },
  { vorname: 'Bernd', nachname: 'Haselmann', geburtsdatum: '11.10.1962', telefon: '+4917651164858', adresse: 'Weißenburgerstraße 28, 86157 Augsburg', email: 'bhas@email.de' },
  { vorname: 'Tanja', nachname: 'Haselmann', geburtsdatum: '26.01.1967', telefon: '+4917651164858', adresse: 'Weißenburgerstraße 28, 86157 Augsburg', email: 'tanjahaselmann@web.de' },
  // Jonathan Haßmüller: keine E-Mail → wird übersprungen (nicht im Array)
  { vorname: 'Roland', nachname: 'Hegele', geburtsdatum: '12.08.1967', telefon: '+491716993087', adresse: 'Brunnenstraße 5, 86441 Zusmarshausen', email: 'a.hegele@hegele.one' },
  // Philippe The Long Hegglin: PLZ+Ort in Quelle in einer Zelle → manuell getrennt
  { vorname: 'Philippe The Long', nachname: 'Hegglin', geburtsdatum: '27.10.1986', telefon: '', adresse: 'Landsberger Straße 86, 86343 Königsbrunn', email: 'ph.hegglin@wohnbau-hegglin.de' },
  { vorname: 'Sonja', nachname: 'Heimerl', geburtsdatum: '02.08.1973', telefon: '01704552778', adresse: 'Amselweg 1, 86830 Schwabmünchen', email: 'sonja.heimerl@web.de' },
  { vorname: 'Julia', nachname: 'Herzog', geburtsdatum: '28.10.1986', telefon: '+4917664905480', adresse: 'Leharstraße 14, 86179 Augsburg', email: 'julia.herzog86@googlemail.com' },
  { vorname: 'Bettina', nachname: 'Hesse', geburtsdatum: '09.11.1990', telefon: '+491734538002', adresse: 'Via-Claudia-Straße 34, 86179 Augsburg', email: 'bhesse@ymail.com' },
  { vorname: 'Alexander', nachname: 'Hirsch', geburtsdatum: '01.07.1995', telefon: '015120577915', adresse: 'Zeuggasse 13, 86150 Augsburg', email: 'alexander-hirsch@live.de' },
  { vorname: 'Mathias', nachname: 'Hobler', geburtsdatum: '30.06.1991', telefon: '017420947943', adresse: 'Friedenstraße 16 1/2, 86179 Augsburg', email: 'hoblermathias@icloud.com' },
  { vorname: 'Annette', nachname: 'Hofstetter', geburtsdatum: '06.12.1967', telefon: '015112787766', adresse: 'Prinz Karl Weg 11 a, 86159 Augsburg', email: 'annette.hofstetter@gmx.de' },
  { vorname: 'Barbara', nachname: 'Kastl', geburtsdatum: '16.06.1978', telefon: '0177-9317483', adresse: 'Konrad-Adenauer-Allee 21, 86150 Augsburg', email: 'b.kastl@gmx.net' },
  { vorname: 'Dominika', nachname: 'Kaszas', geburtsdatum: '28.09.1986', telefon: '+4917626092281', adresse: 'Erstes Quersächsengäßchen 5, 86152 Augsburg', email: 'dominika.kaszas@yahoo.com' },
  { vorname: 'Andreas', nachname: 'Kellinger', geburtsdatum: '27.06.1967', telefon: '+4916036351808', adresse: 'Paul-Reusch-Straße 20 A, 86167 Augsburg', email: 'acdc-andy91@web.de' },
  { vorname: 'Sabrina', nachname: 'Klausnitzer', geburtsdatum: '29.10.1984', telefon: '01711212034', adresse: 'Beethovenstr. 2, 86343 Königsbrunn', email: 'sabif@gmx.net' },
  { vorname: 'Mathias', nachname: 'Klier', geburtsdatum: '27.08.1979', telefon: '015114954803', adresse: 'Am Schäfflerbach 11, 86153 Augsburg', email: 'mathias.klier@gmx.de' },
  { vorname: 'Julia', nachname: 'Klier', geburtsdatum: '08.09.1982', telefon: '01753188128', adresse: 'Am Schäfflerbach 11, 86153 Augsburg', email: 'julia.klier@ur.de' },
  { vorname: 'Sabine', nachname: 'Köhler', geburtsdatum: '18.06.1970', telefon: '01773637550', adresse: 'Heunenstraße 2, 86356 Neusäß', email: 'sabine.d.koehler@hotmail.de' },
  { vorname: 'Claudia', nachname: 'Konsek', geburtsdatum: '22.09.1967', telefon: '+491707742044', adresse: 'Kreuzeckstraße 11, 86163 Augsburg', email: 'claudia.konsek@t-online.de' },
  { vorname: 'Rebecca', nachname: 'Kopeitka', geburtsdatum: '29.03.1988', telefon: '015151782208', adresse: 'Pater-Roth-Str. 21, 86157 Augsburg', email: 'rebecca-ko@msn.com' },
  { vorname: 'Erika', nachname: 'Kovacs', geburtsdatum: '07.02.1983', telefon: '+4915223245785', adresse: 'Herrenbachstraße 33, 86161 Augsburg', email: 'kovacs83erika@gmail.com' },
  { vorname: 'Thomas', nachname: 'Kowalski', geburtsdatum: '24.03.1984', telefon: '017661453831', adresse: 'Zwerchgasse 14, 86150 Augsburg', email: 'kowalski.thomas88@gmail.com' },
  { vorname: 'Marek', nachname: 'Kozak', geburtsdatum: '09.02.1974', telefon: '+491739864221', adresse: 'Ortlerstraße 47, 86163 Augsburg', email: 'kozak-marek@t-online.de' },
  // Eivhenstrasse in Quelle → korrigiert zu Eichenstraße (gleiche Adresse wie Doris Krafzik)
  { vorname: 'Emanuel', nachname: 'Krafzik', geburtsdatum: '11.05.1994', telefon: '01716990162', adresse: 'Eichenstraße 6a, 86504 Merching', email: 'emanuel.krafzik@gmx.de' },
  { vorname: 'Doris', nachname: 'Krafzik', geburtsdatum: '03.02.1968', telefon: '01773717106', adresse: 'Eichenstraße 6a, 86504 Merching', email: 'doris@krafzik.com' },
  { vorname: 'Otto', nachname: 'Kranz', geburtsdatum: '01.05.1964', telefon: '+4915152988851', adresse: 'Seefelderstraße 12, 86163 Augsburg', email: 'kranzotto@aol.com' },
  { vorname: 'Manuela', nachname: 'Kreiner', geburtsdatum: '12.03.1988', telefon: '+491708218477', adresse: 'Afrawald 5, 86150 Augsburg', email: 'manuela_kreiner@gmx.de' },
  { vorname: 'Mario', nachname: 'Kremke', geburtsdatum: '16.03.1990', telefon: '+4915140701775', adresse: 'Fichtelbachstraße 18 B, 86153 Augsburg', email: 'mario.kremke@outlook.de' },
  { vorname: 'Birgit', nachname: 'Krüger', geburtsdatum: '27.02.1956', telefon: '+4915201923514', adresse: 'Provinostraße 11 1/50, 86153 Augsburg', email: 'birgitkrueger@online.de' },
  // Beide Kurtagics haben gleiche E-Mail — beide werden importiert (verschiedene Vornamen)
  { vorname: 'Samir', nachname: 'Kurtagic', geburtsdatum: '14.02.1983', telefon: '+4917647664731', adresse: 'Robert-Bosch-Straße 14A, 86167 Augsburg', email: 'krimask@hotmail.com' },
  { vorname: 'Adisa', nachname: 'Kurtagic', geburtsdatum: '26.06.1982', telefon: '+4917647664731', adresse: 'Robert-Bosch-Straße 14A, 86167 Augsburg', email: 'krimask@hotmail.com' },
  // Lukas Lawrence: keine E-Mail → übersprungen
  { vorname: 'Timo', nachname: 'Lechner', geburtsdatum: '10.04.1995', telefon: '01741795666', adresse: 'Gemeindewald 2, 86672 Thierhaupten', email: 'timolechner1860@icloud.com' },
  { vorname: 'Marlene', nachname: 'Leister', geburtsdatum: '17.09.1980', telefon: '+4917663491188', adresse: 'Sieglindenstrasse 18, 86152 Augsburg', email: 'marlene.leister17@gmail.com' },
  { vorname: 'Anna', nachname: 'Lindenthal', geburtsdatum: '05.08.1947', telefon: '', adresse: 'Garmischer Straße 46, 86163 Augsburg', email: 'lindenthalaf@gmx.de' },
  { vorname: 'Kerstin', nachname: 'Lindloff', geburtsdatum: '18.05.1978', telefon: '0160/8584042', adresse: 'Meisenweg 61, 86156 Augsburg', email: 'kerstin.lindloff@gmx.de' },
  // Lisa Mesch + Lukas Stahl: keine E-Mail → übersprungen
  { vorname: 'Constantin', nachname: 'Lungu', geburtsdatum: '21.07.2007', telefon: '+491798114625', adresse: 'Hinter den Gärten 23 1/2, 86157 Augsburg', email: 'coslun055@gmail.com' },
  { vorname: 'Mustafa', nachname: 'Maaß', geburtsdatum: '09.02.1991', telefon: '017670680210', adresse: 'Robert-Bosch-Straße 14A, 86167 Augsburg', email: 'mustafamaass@web.de' },
  { vorname: 'Dominik', nachname: 'Mader', geburtsdatum: '27.03.1981', telefon: '01794636188', adresse: 'Werderstraße 1, 86159 Augsburg', email: 'dominik.mader@googlemail.com' },
  { vorname: 'Kevin', nachname: 'Makowski', geburtsdatum: '29.11.1999', telefon: '+4917685555522', adresse: 'Nördlinger Straße 179, 86343 Königsbrunn', email: 'kevin.makowski@icloud.com' },
  { vorname: 'Reinhold', nachname: 'Maybaum', geburtsdatum: '20.06.1961', telefon: '+491793920122', adresse: 'Gut-Lindenau 9, 86438 Kissing', email: 'reinhold.maybaum@gmx.de' },
  { vorname: 'Anna', nachname: 'Mayer', geburtsdatum: '18.11.1957', telefon: '015120644057', adresse: 'Fröschweilerstraße 24, 86316 Friedberg', email: 'maya44@gmx.net' },
  { vorname: 'Martina', nachname: 'Merz', geburtsdatum: '24.12.1971', telefon: '+4915164036214', adresse: 'Zwerchgasse 10, 86150 Augsburg', email: 'tini71@icloud.com' },
  { vorname: 'Gresa', nachname: 'Mustafa', geburtsdatum: '09.02.1999', telefon: '+4917647000716', adresse: 'Lilienthalstraße 19, 86415 Mering', email: 'gresa.mustafa@outlook.de' },
  { vorname: 'Maximilian', nachname: 'Naegele', geburtsdatum: '25.06.1996', telefon: '015120515544', adresse: 'Kernriedstrasse 20, 86156 Augsburg', email: 'obmarten@freenet.de' },
  { vorname: 'Frank', nachname: 'Neumann', geburtsdatum: '27.02.1968', telefon: '+4915129134437', adresse: 'Siebenbrunn 50, 86179 Augsburg', email: 'neumann@verlag.cc' },
  { vorname: 'Eva', nachname: 'Neumann', geburtsdatum: '18.11.1963', telefon: '01795136204', adresse: 'Siebenbrunn 50, 86179 Augsburg', email: 'eva@elfdesign.de' },
  { vorname: 'Thorsten', nachname: 'Obermayer', geburtsdatum: '26.03.1984', telefon: '4915154625276', adresse: 'Flurstraße 52, 86154 Augsburg', email: 'obermayerthorsten@gmail.com' },
  { vorname: 'Michelle', nachname: 'Ogunrinde', geburtsdatum: '08.07.1995', telefon: '017623402371', adresse: 'Bismarckstr. 58, 86391 Stadtbergen', email: 'michellemisayo@outlook.de' },
  { vorname: 'Anne-Kathrin', nachname: 'Ostrzolek', geburtsdatum: '13.07.1984', telefon: '+4917620113405', adresse: 'Kriemhildstraße 4, 86356 Neusäß', email: 'anne_kathrin_ertl@yahoo.de' },
  { vorname: 'Daniel', nachname: 'Ot', geburtsdatum: '13.04.1965', telefon: '015175968733', adresse: 'Winterstraße 18, 86368 Gersthofen', email: 'danielot0413@gmail.com' },
  { vorname: 'Angelika', nachname: 'Pflug Blahak', geburtsdatum: '07.04.1959', telefon: '01792274868', adresse: 'Moltkestr. 1, 86159 Augsburg', email: 'angelika-pflug-blahak@web.de' },
  { vorname: 'Anna', nachname: 'Polednia', geburtsdatum: '27.09.1968', telefon: '+4917681153440', adresse: 'Schillstraße 131 A, 86169 Augsburg', email: 'annapolednia@outlook.com' },
  { vorname: 'Birgit', nachname: 'Rapisarda', geburtsdatum: '10.02.1964', telefon: '+4915233747153', adresse: 'Brunnenstraße 24, 86165 Augsburg', email: 'birgit.rapisarda@br-concepte.de' },
  { vorname: 'Andrea', nachname: 'Renner', geburtsdatum: '31.01.1962', telefon: '01702135789', adresse: 'Brückenstraße 27, 86153 Augsburg', email: 'info@immodesign-ar.de' },
  { vorname: 'Karin', nachname: 'Römer', geburtsdatum: '28.10.1980', telefon: '+491704717678', adresse: 'Wasenmeisterweg 20, 86199 Augsburg', email: 'hallo@meinistdein-augsburg.de' },
  { vorname: 'Sonja', nachname: 'Rupprecht', geburtsdatum: '11.03.1993', telefon: '+491638037101', adresse: 'Körnerstraße 34, 86157 Augsburg', email: 'sonja.rupprecht@hotmail.de' },
  { vorname: 'Olha', nachname: 'Ryzhyi', geburtsdatum: '06.08.1968', telefon: '+4915141953681', adresse: 'Kirchbergstraße 5, 86157 Augsburg', email: 'o.hhaarraa@gmail.com' },
  { vorname: 'Kathrin', nachname: 'Sauer', geburtsdatum: '23.09.1983', telefon: '+4917620555820', adresse: 'Ludwig-Thoma-Straße 45, 86157 Augsburg', email: 'kathrin-sauer@gmx.de' },
  { vorname: 'Josef', nachname: 'Schmaus', geburtsdatum: '10.04.1960', telefon: '+491751607986', adresse: 'Pranthochstraße 6, 86150 Augsburg', email: 'jschmaus@gmx.de' },
  { vorname: 'Johannes', nachname: 'Schmaus', geburtsdatum: '17.01.1962', telefon: '+491713343676', adresse: 'Postweg 6, 86577 Sielenbach', email: 'josch1762@outlook.de' },
  { vorname: 'Anne', nachname: 'Schmid', geburtsdatum: '15.02.1989', telefon: '+4917622822686', adresse: 'Innsbrucker Straße 10 A, 86163 Augsburg', email: 'anne@schmid-fdb.de' },
  // Rainer Schmid: kein Geburtstag, keine Adresse in der Quelle
  { vorname: 'Rainer', nachname: 'Schmid', geburtsdatum: '', telefon: '+491636176919', adresse: '', email: 'rwsch@duck.com' },
  { vorname: 'Thomas', nachname: 'Schmidt', geburtsdatum: '18.02.1996', telefon: '01706379190', adresse: 'Mittenwalder Str. 22, 86163 Augsburg', email: 'thomaschmidt104@gmail.com' },
  { vorname: 'Helmut', nachname: 'Scholz', geburtsdatum: '15.06.1976', telefon: '0170/3007111', adresse: 'Reischlestr 38, 86153 Augsburg', email: 'helmutscholz7@gmx.de' },
  { vorname: 'Cornelia', nachname: 'Schöttner', geburtsdatum: '16.01.1972', telefon: '015114472307', adresse: 'Parkstrasse 11, 86356 Neusäß', email: 'feuerteufel2008@arcor.de' },
  // Anna Schütz: keine E-Mail → übersprungen
  { vorname: 'Simon', nachname: 'Schwenold', geburtsdatum: '22.12.1990', telefon: '+491715140741', adresse: 'Dr.-lagai-str. 7/1, 86159 Augsburg', email: 'schwenolds@yahoo.com' },
  { vorname: 'Ferdinand', nachname: 'Seeberger', geburtsdatum: '24.07.1963', telefon: '+4915146161644', adresse: 'Augsburger Straße 10, 86391 Stadtbergen', email: 'ferdinand@seeberger-web.com' },
  // PLZ 861447 aus Quelle übernommen (vermutlich 86447 Aindlingen — bitte prüfen)
  { vorname: 'Daniela', nachname: 'Settele', geburtsdatum: '26.03.1980', telefon: '+4915110726004', adresse: 'Schlossstraße 7A, 861447 Aindlingen', email: 'danielasettele@gmx.de' },
  { vorname: 'Laura', nachname: 'Sommerauer', geburtsdatum: '03.08.1968', telefon: '+4915771596098', adresse: 'Königsberger 77, 86167 Augsburg', email: 'jimmybv1@yahoo.de' },
  { vorname: 'Manuela', nachname: 'Stahl', geburtsdatum: '18.04.1973', telefon: '+491774153816', adresse: 'Keltenweg 15, 86407 Horgau', email: 'info@galasport.de' },
  { vorname: 'Franziska', nachname: 'Suchanek', geburtsdatum: '29.11.1985', telefon: '+4915164956619', adresse: 'Waisengäßchen 1, 86150 Augsburg', email: 'suchanekfranziska@gmx.de' },
  { vorname: 'Dani', nachname: 'Thume', geburtsdatum: '21.02.1973', telefon: '+491754044867', adresse: 'Willi-Weise-Straße 36, 86157 Augsburg', email: 'daniela.thume@posteo.de' },
  { vorname: 'Judith', nachname: 'Thumm', geburtsdatum: '20.01.1965', telefon: '+491796979050', adresse: 'Frauentorstraße 8, 86152 Augsburg', email: 'pilatesamdom@gmail.com' },
  { vorname: 'Bettina', nachname: 'Trojan', geburtsdatum: '01.09.1988', telefon: '+491746333173', adresse: 'Sankt-Barbara-Straße 14, 89331 Burgau', email: 'bettina.trojan@web.de' },
  { vorname: 'Birgit', nachname: 'Völker', geburtsdatum: '28.01.1987', telefon: '+436767920813', adresse: 'Bauerntanzgäßchen 3, 86150 Augsburg', email: 'birgitvoelker@gmx.at' },
  { vorname: 'Erik', nachname: 'Völker-Grotz', geburtsdatum: '14.12.1970', telefon: '+4917681606379', adresse: 'Bauerntanzgäßchen 3, 86150 Augsburg', email: 'erikvoelker@gmx.de' },
  { vorname: 'Pia', nachname: 'Waldner', geburtsdatum: '16.09.1960', telefon: '+491743366877', adresse: 'Ziegeleistraße 16, 86399 Bobingen', email: 'pia.waldner60@gmail.com' },
  { vorname: 'Mona', nachname: 'Waller', geburtsdatum: '02.07.1990', telefon: '+491737597574', adresse: 'Johannes-haag-Straße 3, 86153 Augsburg', email: 'mona_waller@gmx.de' },
  { vorname: 'Xue', nachname: 'Wang', geburtsdatum: '23.02.1987', telefon: '017631749740', adresse: 'Taunusstraße 50, 86368 Gersthofen', email: 'michellexuewang@gmail.com' },
  { vorname: 'Alexandra', nachname: 'Wazulek', geburtsdatum: '27.03.1985', telefon: '+15232730351', adresse: 'Robert-Koch-Straße 30, 86343 Königsbrunn', email: 'wazuleka@gmail.com' },
  { vorname: 'Ellen', nachname: 'Weber', geburtsdatum: '21.12.1987', telefon: '015156343024', adresse: 'Von-Langenmantel-Straße 20, 86356 Neusäß', email: 'ellen.weber@mailbox.org' },
  { vorname: 'Renate', nachname: 'Weber', geburtsdatum: '17.07.1954', telefon: '+49821573190', adresse: 'Pfarrer-Bogner-Straße 1, 86199 Augsburg', email: 'renataweber2013@gmail.com' },
  { vorname: 'Julia', nachname: 'Wendler', geburtsdatum: '04.09.1988', telefon: '+4915153908716', adresse: 'Jakoberwallstraße 5, 86153 Augsburg', email: 'juwendler@web.de' },
  { vorname: 'Susi', nachname: 'Wirth', geburtsdatum: '30.07.1966', telefon: '+4915775309767', adresse: 'Schäfflerstraße 7a, 86424 Dinkelscherben', email: 'susi.wirth@googlemail.com' },
  { vorname: 'Maximilian', nachname: 'Witzani', geburtsdatum: '14.02.1991', telefon: '015141236361', adresse: 'Burgfriedenstr. 13, 86159 Augsburg', email: 'maximilian.witzani@gmx.de' },
  { vorname: 'Amira', nachname: 'Ziegler', geburtsdatum: '04.06.1995', telefon: '+4915259469646', adresse: 'Anna-Krölin-Platz 2, 86153 Augsburg', email: 'amira_ziegler@web.de' },
  { vorname: 'Petra', nachname: 'Zimmermann', geburtsdatum: '14.02.1964', telefon: '01727664339', adresse: 'Ahornweg 3, 86368 Gersthofen', email: 'snoopy.zimmermann@t-online.de' },
  { vorname: 'Stefan', nachname: 'Zingerle', geburtsdatum: '22.06.1968', telefon: '+491754144106', adresse: 'Kaufbeurerstraße 36, 87719 Mindelheim', email: 'stefan.zingerle@gmx.de' },
  { vorname: 'Kai', nachname: 'Zoglauer', geburtsdatum: '27.08.1975', telefon: '+4916097757433', adresse: 'Beethovenstraße 2, 86343 Königsbrunn', email: 'kai.zoglauer@web.de' },
];

async function main() {
  console.log(`Import gestartet: ${mitglieder.length} Einträge zu verarbeiten`);
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const m of mitglieder) {
    const email = m.email.toLowerCase();
    try {
      const existing = await prisma.customer.findFirst({
        where: { email, vorname: m.vorname, nachname: m.nachname },
      });
      if (existing) {
        console.log(`  SKIP: ${m.vorname} ${m.nachname} (${email}) — bereits vorhanden`);
        skipped++;
        continue;
      }
      await prisma.customer.create({
        data: {
          vorname: m.vorname,
          nachname: m.nachname,
          email,
          telefon: m.telefon,
          geburtsdatum: m.geburtsdatum,
          adresse: m.adresse,
          status: 'mitglied',
          herkunft: 'Import Bestandsmitglieder 2025',
        },
      });
      console.log(`  OK:   ${m.vorname} ${m.nachname}`);
      created++;
    } catch (err) {
      console.error(`  ERR:  ${m.vorname} ${m.nachname} — ${err.message}`);
      errors++;
    }
  }

  console.log(`\nFertig: ${created} erstellt, ${skipped} übersprungen, ${errors} Fehler`);
}

main().finally(() => prisma.$disconnect());
