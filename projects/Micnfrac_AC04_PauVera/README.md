# Fractal Espiral Audio-Reactiu

## Descripció
Aquest projecte mostra un fractal en forma d'espiral/flama que reacciona en temps real al so del micròfon. El fractal canvia la seva forma, mida i moviment segons el volum i les freqüències del so ambient.

## Tipus de fractal
Fractal recursiu amb forma d’espiral/flama, generat amb una funció que es divideix en dues branques reduïdes successivament.

## Paràmetres controlats pel so
- **Volum**: fa que el fractal creixi o disminueixi (efecte de pulsació).
- **Greus**: fan girar el fractal (rotació).
- **Aguts**: augmenten o redueixen el nombre de braços de l’espiral.

## Funcions de p5.sound utilitzades
- `p5.AudioIn()` per captar el micròfon.
- `p5.Amplitude()` per detectar el volum.
- `p5.FFT()` per analitzar freqüències (greus i aguts).
- `userStartAudio()` per activar l’àudio quan l’usuari interactua.

## Decisions estètiques
- Colors en mode HSB per crear un efecte visual tipus flama o mandala.
- Moviment suau amb rotació i pulsació perquè la reacció sigui clara i atractiva.
- Fons fosc per destacar les formes i els colors del fractal.
