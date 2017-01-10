import {Howl} from 'howler';

export function playTaskCheckSound() {
	new Howl({
		src: ['sounds/checkSound1.mp3'],
		sprite: {
			check: [100, 99999]
		},
		volume: 0.3
	}).play("check");
}
