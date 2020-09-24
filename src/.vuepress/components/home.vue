<template>
	<main class="main" :aria-labelledby="data.heroText !== null ? 'main-title' : null">
		<header class="hero">
			<img v-if="data.heroImage" :src="$withBase(data.heroImage)" :alt="data.heroAlt || 'hero'" />

			<h1 v-if="data.heroText !== null" id="main-title">{{ data.heroText || $title || 'Hello' }}</h1>

			<p v-if="data.action" class>
				<NavLink v-for="act in data.action" :key="act.text" :item="act" class="action" />
			</p>
		</header>

		<div v-if="data.features && data.features.length" class="features">
			<div v-for="(feature, index) in data.features" :key="index" class="feature">
				<h2>{{ feature.title }}</h2>
				<p>{{ feature.details }}</p>
			</div>
		</div>

		<div v-if="data.footer" class="footer">{{ data.footer }}</div>
	</main>
</template>

<script>
import NavLink from "@theme/components/NavLink.vue";
//import p5 from "p5";

export default {
	components: { NavLink },
	data() {
		return {};
	},
	beforeMount() {
		/*
		window.p5 = p5;
		import("p5/lib/addons/p5.sound").then((_) => {
			import("jsxm/xm").then((xm) => {
				import("jsxm/xmeffects").then((_) => {
					let [n] = this.$el.getElementsByClassName("p5p5");
					let canvas = new p5((sketch) => {
						for (const ev of ["setup", "draw", "keypressed"]) {
							sketch[ev] = (...args) => {
								this[ev](sketch, ...args);
							};
						}
					}, n);
					window.AudioContext = () => {
						console.log("t");
						return canvas.getAudioContext();
					}
					XMPlayer.init();
					let xmReq = new XMLHttpRequest();
					xmReq.open(
						"GET",
						"https://a1k0n-pub.s3.amazonaws.com/xm/kamel.xm",
						true
					);
					xmReq.responseType = "arraybuffer";
					xmReq.onload = function (xmEvent) {
						let arrayBuffer = xmReq.response;
						if (arrayBuffer) {
							XMPlayer.load(arrayBuffer);
							XMPlayer.play();
						} else {
							console.log("unable to load", uri);
						}
					};
					xmReq.send(null);
				});
			});
		});
		*/
	},
	computed: {
		data() {
			return this.$page.frontmatter;
		},
		actionLink() {
			return {
				link: this.data.actionLink,
				text: this.data.actionText,
			};
		},
	},

	methods: {
		setup(sk) {
			console.log(sk);
			sk.background("green");
			sk.text("Hello p5!", 20, 20);
			this.fft = new p5.FFT();
			this.peakDetect = new p5.PeakDetect();
		},
		draw(sk) {
			this.fft.analyze();
			this.peakDetect.update(this.fft);
			let ellipseWidth = 20;
			if (this.peakDetect.isDetected) {
				ellipseWidth = 50;
			} else {
				ellipseWidth *= 0.95;
			}
			sk.ellipse(50, 50, ellipseWidth, ellipseWidth);
		},
		keypressed(sk) {
			// convert the key code to it's string
			// representation and print it
			const key = String.fromCharCode(sk.keyCode);
			sk.print(key);
		},
	},
};
</script>

<style lang="stylus">
.main {
	padding: $navbarHeight 2rem 0;
	max-width: $mainPageWidth;
	margin: 0px auto;
	display: block;

	.hero {
		text-align: center;

		img {
			max-width: 100%;
			max-height: 200px;
			margin: 3rem auto 1.5rem;
		}

		h1 {
			font-size: 3rem;
		}

		h1, .description, .action {
			margin: 1.8rem auto;
		}

		.description {
			max-width: 35rem;
			font-size: 1.6rem;
			line-height: 1.3;
			color: lighten($textColor, 40%);
		}

		.action-button {
			display: inline-block;
			font-size: 1.2rem;
			color: #fff;
			background-color: $accentColor;
			padding: 0.8rem 1.6rem;
			border-radius: 4px;
			transition: background-color 0.1s ease;
			box-sizing: border-box;
			border-bottom: 1px solid darken($accentColor, 10%);

			&:hover {
				background-color: lighten($accentColor, 10%);
			}
		}
	}

	.features {
		border-top: 1px solid $borderColor;
		padding: 1.2rem 0;
		margin-top: 2.5rem;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		align-content: stretch;
		justify-content: space-between;
	}

	.feature {
		flex-grow: 1;
		flex-basis: 30%;
		max-width: 30%;

		h2 {
			font-size: 1.4rem;
			font-weight: 500;
			border-bottom: none;
			padding-bottom: 0;
			color: lighten($textColor, 10%);
		}

		p {
			color: lighten($textColor, 25%);
		}
	}

	.footer {
		padding: 2.5rem;
		border-top: 1px solid $borderColor;
		text-align: center;
		color: lighten($textColor, 25%);
	}
}

@media (max-width: $MQMobile) {
	.main {
		.features {
			flex-direction: column;
		}

		.feature {
			max-width: 100%;
			padding: 0 2.5rem;
		}
	}
}

@media (max-width: $MQMobileNarrow) {
	.main {
		padding-left: 1.5rem;
		padding-right: 1.5rem;

		.hero {
			img {
				display: inline-block;
				max-height: 210px;
				margin: 2rem auto 1.2rem;
			}

			h1 {
				font-size: 2rem;
			}

			h1, .description, .action {
				margin: 1.2rem auto;
			}

			.description {
				font-size: 1.2rem;
			}

			.action-button {
				font-size: 1rem;
				padding: 0.6rem 1.2rem;
			}
		}

		.feature {
			h2 {
				font-size: 1.25rem;
			}
		}
	}
}
</style>
