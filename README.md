# Waaaaaac Woooooooc (AC.03)

Aquest projecte simula una "groan tube" utilitzant el moviment del mòbil i síntesi sonora amb p5.js i p5.sound.

## Mapejos utilitzats

- **Intensitat del moviment**: calculada a partir de la diferència entre acceleracions consecutives. Aquest valor controla:
  - el **volum** de l’oscil·lador
  - el **brillo** del so a través del filtre low-pass

- **Orientació del mòbil (accelerationZ)**:
  - controla el **pitch** del so dins d’un rang definible (pitch mínim i màxim)

Tots els valors s’han suavitzat amb `lerp` per evitar canvis bruscos.

## Disseny sonor

- Oscil·lador tipus **sawtooth** per aconseguir un so més ric i aspre.
- **Filtre low-pass** per controlar el timbre segons la intensitat del moviment.
- Control d’amplitud suau mitjançant interpolació (`osc.amp(..., 0.05)`).

## Dificultats trobades

- Ajustar la sensibilitat del mòbil perquè no reaccionés massa o massa poc.
- Evitar salts bruscos en el pitch i el volum (solució: suavitzat amb `lerp`).
- Gestió del permís de sensors en iOS i activació del context d’àudio en mòbil.
