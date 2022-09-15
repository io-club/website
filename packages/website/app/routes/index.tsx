import type { EngineOptions, SceneOptions } from '@babylonjs/core';

import { Analyser, ArcRotateCamera, Camera, Color4, CreateGround, Effect, Engine, Scene, ShaderMaterial, Sound, SoundTrack, Texture, Vector2, Vector3 } from '@babylonjs/core'
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui'
import { useNavigate } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { ClientOnly } from 'remix-utils'

interface DemoAsset {
	common: string
	vert: string
	frag: string
	music: ArrayBuffer
}

interface DemoProps {
	antialias?: EngineOptions['antialias']
	adaptToDeviceRatio?: EngineOptions['adaptToDeviceRatio']
	engineOptions?: EngineOptions
	sceneOptions?: SceneOptions
}

const Demo = function({
	antialias,
	engineOptions,
	adaptToDeviceRatio,
	sceneOptions,
	...rest }: DemoProps) {
	const reactCanvas = useRef(null)
	const navigate = useNavigate()

	const createScene = (scene: Scene, asset: DemoAsset) => {
		scene.clearColor = new Color4(0.1, 0.1, 0.15, 1)

		const camera = new ArcRotateCamera(
			'camera',
			0,
			0,
			4,
			new Vector3(0, 0, 0),
			scene
		)
		camera.mode = Camera.ORTHOGRAPHIC_CAMERA
		camera.orthoTop = 1
		camera.orthoBottom = -1
		camera.orthoLeft = -1
		camera.orthoRight = 1

		//const canvas = scene.getEngine().getRenderingCanvas()
		//camera.attachControl(canvas)

		Effect.IncludesShadersStore['common'] = asset.common

		const mat = new ShaderMaterial('shader', scene,
			{ vertexSource: asset.vert, fragmentSource: asset.frag },
			{
				attributes: ['position', 'normal', 'uv'],
				uniforms: [
					'world', 'worldView', 'worldViewProjection', 'view',
					'iTime',
					'iResolution',
				],
			},
		)

		const plane = CreateGround('canvas', { width: 2, height: 2 }, scene)
		plane.material = mat
		plane.rotation.y = Math.PI / 2

		//const textPlane = CreateGround('canvas', { width: 2, height: 2 }, scene)
		//textPlane.hasVertexAlpha = true
		//textPlane.rotation.y = Math.PI / 2

		const music = new Sound('Music', asset.music, null, () => {
			music.play(0, 0, 200)
			music.updateOptions({
				offset: 32,
			})
		}, {
			loop: true,
			volume: 0.15,
		})
		const soundTrack = new SoundTrack(scene)
		soundTrack.addSound(music)

		const groundTexture = new Texture('/ground.jpg', scene, true, false, Texture.BILINEAR_SAMPLINGMODE)

		const musicFFT = new Analyser(scene)
		soundTrack.connectToAnalyser(musicFFT)
		//musicFFT.drawDebugCanvas()
		//const freqTexture = RawTexture.CreateRTexture(null, 32, 1, scene, false, false, Texture.NEAREST_SAMPLINGMODE, Engine.TEXTURETYPE_UNSIGNED_BYTE)
		//
		const gui = AdvancedDynamicTexture.CreateFullscreenUI('gui', true, scene)

		const keys: string[] = []
		const contra = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
		const canvas = scene.getEngine().getRenderingCanvas()
		canvas?.focus()
		canvas?.addEventListener('keydown', (ev) => {
			if (ev.repeat) return
			keys.push(ev.key)
			if (keys.length == 10) {
				console.log(keys)
				let v = true
				for (let i = 0; i < 10; i++) v = v && contra[i].toLowerCase() === keys[i].toLowerCase()
				if (v) navigate('/register?type=badass')
				keys.shift()
			}
		}, false)

		interface ButtonOptions {
			text: string
			background?: string
			color?: string
			cornerRadius?: number
			width?: string
			height?: string
			top?: string
			clickable?: boolean
			onPointerUpObservable?: () => void
		}
		const btnTexts: ButtonOptions[] = [
			{
				text: 'Here is I/O Lab',
				width: '210px',
			},
			{
				text: 'Happy hacking!',
				width: '250px',
			},
			{
				text: 'Click! Join us now!',
				width: '250px',
				color: '#111',
				clickable: true,
				onPointerUpObservable: () => {
					console.log(333)
					navigate('/register')
				},
			},
			{
				text: 'Remember Contra cheats?',
				width: '250px',
				height: '80px',
			},
		]
		const tickMax = 250
		let btn: Button | null = null
		let btnCnt = 0
		let time = 0
		let tick = tickMax
		scene.registerBeforeRender(() => {
			if (tick++ === tickMax) {
				if (btn) gui.removeControl(btn)
				const newBtn = btnTexts[btnCnt]
				btn = Button.CreateSimpleButton('btn', newBtn.text)
				btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
				btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
				btn.width = newBtn.width ?? '200px'
				btn.height = newBtn.height ?? '60px'
				btn.background = newBtn.background ?? '#eee'
				btn.color = newBtn.color ?? '#666'
				btn.cornerRadius = newBtn.cornerRadius ?? 40
				btn.top = newBtn.top ?? '-100px'
				btn.isHitTestVisible = newBtn.clickable ?? false
				if (newBtn.onPointerUpObservable) btn.onPointerUpObservable.addOnce(newBtn.onPointerUpObservable)
				btn.fontSize = 24
				btn.fontStyle = 'bold'
				btn.shadowBlur = 0
				gui.addControl(btn);
				if (++btnCnt === btnTexts.length) btnCnt = 0
				tick = 0
			}

			mat.setFloat('iTime', time)
			time += scene.getEngine().getDeltaTime() / 1000
			mat.setVector2('iResolution', new Vector2(scene.getEngine().getAspectRatio(camera), 1))

			// compute average freq data
			const musicData = musicFFT.getByteFrequencyData()
			const musicFreqHigh = musicData.slice(0, 8).reduce((p, c, _) => p + c / 255, 0)
			const musicFreqLow = musicData.reverse().slice(0, 256).reduce((p, c, _) => p + c / 255, 0)
			mat.setFloat('iFreq', (musicFreqLow + musicFreqHigh) / 264)

			//freqTexture.update(musicFFT.getByteFrequencyData())
			//mat.setTexture('iFreqAll', freqTexture)
			mat.setTexture('iGround', groundTexture)
		})
	}

	const fetchAsset: () => Promise<DemoAsset> = async function() {
		return {
			common: await (await fetch('/common.glsl')).text(),
			vert: await (await fetch('/demo.vert.glsl')).text(),
			frag: await (await fetch('/demo.frag.glsl')).text(),
			music: await (await fetch('/Malmen_-_Edison_Glam.ogg')).arrayBuffer(),
		}
	}


	useEffect(() => {
		const { current: canvas } = reactCanvas
		if (!canvas) return

		const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio)
		const scene = new Scene(engine, sceneOptions)

		fetchAsset().then(asset => {
			if (scene.isReady() && createScene) {
				createScene(scene, asset)
			} else if (createScene) {
				scene.onReadyObservable.addOnce((scene) => createScene(scene, asset))
			}

			engine.runRenderLoop(() => scene.render())
		})

		const resize = () => scene.getEngine().resize()
		if (window) window.addEventListener('resize', resize)
		return () => {
			scene.getEngine().dispose()
			if (window) window.removeEventListener('resize', resize)
		}
	}, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions])

	return <canvas style={{ height: '100%', width: '100%' }} ref={reactCanvas} {...rest} />
}

export default () => <ClientOnly>{() => <Demo />}</ClientOnly>
