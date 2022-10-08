import type { BinaryFileAssetTask, EngineOptions, SceneOptions, TextFileAssetTask } from '@babylonjs/core'

import { Analyser, ArcRotateCamera, AssetsManager, Camera, Color4, CreateGround, DynamicTexture, Effect, Engine, HemisphericLight, MeshBuilder, RawTexture, Scene, ShaderMaterial, Sound, SoundTrack, StandardMaterial, Texture, Vector2, Vector3, Vector4 } from '@babylonjs/core'
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui'
import { useNavigate } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { ClientOnly } from 'remix-utils'

interface DemoAsset {
	common: TextFileAssetTask
	vert: TextFileAssetTask
	frag: TextFileAssetTask
	music: BinaryFileAssetTask
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

	useEffect(() => {
		const createScene = (scene: Scene, asset: DemoAsset) => {
			console.log('Can you find the hidden register? TIP: classic game cheat keys')
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
			camera.layerMask = 0x20000000

			Effect.IncludesShadersStore['common'] = asset.common.text
			const mat = new ShaderMaterial('shader', scene,
				{ vertexSource: asset.vert.text, fragmentSource: asset.frag.text },
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
			plane.layerMask = 0x20000000

			const music = new Sound('Music', asset.music.data, null, () => {
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
			const freqTexture = RawTexture.CreateRTexture(null, 32, 1, scene, false, false, Texture.NEAREST_SAMPLINGMODE, Engine.TEXTURETYPE_UNSIGNED_BYTE)

			// 2nd camera
			const sCamera = new ArcRotateCamera(
				'camera',
				0,
				0,
				4,
				new Vector3(0, 0, 0),
				scene
			)

			const light = new HemisphericLight('light', new Vector3(-4, 2, 0), scene)
			light.intensity = 0.7
			light.excludeWithLayerMask = 0x20000000

			const faceColors = new Array(6)
			faceColors[0] = Color4.FromHexString('#8b5cf6')
			faceColors[1] = Color4.FromHexString('#10b981')
			faceColors[2] = Color4.FromHexString('#ef4444')
			faceColors[3] = Color4.FromHexString('#3b82f6')
			faceColors[4] = Color4.FromHexString('#f5930b')
			faceColors[5] = Color4.FromHexString('#ec4899')

			const dynamicTexture = new DynamicTexture('text', { width: 912, height: 152 }, scene)
			const cubemat = new StandardMaterial('cubemat', scene)
			cubemat.alpha = .8
			dynamicTexture.drawText('Cool', 28, 90, '40px solid Arial', 'white', null)
			dynamicTexture.drawText('Edison', 168, 64, '35px solid Arial', 'white', null)
			dynamicTexture.drawText('Galm -', 168, 94, '35px solid Arial', 'white', null)
			dynamicTexture.drawText('Malmen', 168, 124, '35px solid Arial', 'white', null)
			dynamicTexture.drawText('2022', 334, 90, '40px solid Arial', 'white', null)
			dynamicTexture.drawText('Hack', 473, 90, '40px solid Arial', 'white', null)
			dynamicTexture.drawText('IOLab', 630, 90, '40px solid Arial', 'white', null)
			dynamicTexture.drawText('Cheat', 775, 90, '40px solid Arial', 'white', null)
			cubemat.emissiveTexture = dynamicTexture

			const faceUV = new Array(6)
			for (let i = 0; i < 6; i++) {
				faceUV[i] = new Vector4(i / 6, 0, (i + 1) / 6, 1)
			}
			const box = MeshBuilder.CreateBox('box', {
				size: 0.3,
				faceColors: faceColors,
				faceUV: faceUV,
			})
			box.material = cubemat
			box.position.y += 2

			// gui
			const gui = AdvancedDynamicTexture.CreateFullscreenUI('gui', true, scene)

			const keys: string[] = []
			const contra = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
			const canvas = scene.getEngine().getRenderingCanvas()
			canvas?.focus()
			canvas?.addEventListener('keydown', (ev) => {
				if (ev.repeat) return
				keys.push(ev.key)
				if (keys.length == 10) {
					let v = true
					for (let i = 0; i < 10; i++) v = v && contra[i].toLowerCase() === keys[i].toLowerCase()
					if (v) navigate('/register?type=badass')
					keys.shift()
				}
			}, false)

			// set cameras
			scene.activeCameras = [camera, sCamera]

			//button List
			const btnList:Array<{
				text:string;
				nevigate:string;
			}> = [
				{
					text:'Click! Join us now!',
					nevigate:'register'
				},
				{
					text:'To Home',
					nevigate:'home'
				}
			]
			btnList.forEach(({text,nevigate},index)=>{
				console.log(index)
				const btn = Button.CreateSimpleButton('btn', text)
				btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
				btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
				btn.width = '250px'
				btn.height = '80px'
				btn.background = '#eee'
				btn.color = '#111'
				btn.cornerRadius = 80
				btn.top = -100*++index+"px"
				btn.isHitTestVisible = true
				btn.onPointerClickObservable.addOnce(() => {
					navigate(`${nevigate}`)
				})
				btn.fontSize = 24
				btn.fontStyle = 'bold'
				btn.shadowBlur = 0
				gui.addControl(btn)
			})

			let time = 0
			scene.registerBeforeRender(() => {
				const deltaTime = scene.getEngine().getDeltaTime() / 1000
				time += deltaTime

				// shader plne
				mat.setFloat('iTime', time)
				mat.setVector2('iResolution', new Vector2(scene.getEngine().getAspectRatio(camera), 1))
				freqTexture.update(musicFFT.getByteFrequencyData())
				mat.setTexture('iFreqAll', freqTexture)
				mat.setTexture('iGround', groundTexture)

				// cube
				const s1 = musicFFT.getByteFrequencyData()
				const s2 = (s1.reverse().slice(0, 256).reduce((p, c, _) => p + c / 255, 0) / 256 * 10) % 1
				const s = 0.9 * s2 + 1.0 * (1 - s2)
				box.scaling = new Vector3(s, s, s)
				let g = Math.tan(time)
				if (g > 2) g = 2
				else if (g < -2) g = -2
				box.addRotation(Math.sin(time) / 24, g / 32,  - Math.cos(time) / 32)
			})
		}

		const { current: canvas } = reactCanvas
		if (!canvas) return

		const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio)
		const scene = new Scene(engine, sceneOptions)
		const assetsManager = new AssetsManager(scene)
		const assets: DemoAsset = {
			common: assetsManager.addTextFileTask('common', '/common.glsl'),
			vert: assetsManager.addTextFileTask('vert', '/demo.vert.glsl'),
			frag: assetsManager.addTextFileTask('frag', '/demo.frag.glsl'),
			music: assetsManager.addBinaryFileTask('music', '/Malmen_-_Edison_Glam.ogg'),
		}

		assetsManager.onProgress = function(remainingCount, totalCount, lastTask) {
			engine.loadingUIText = `Loading...... ${lastTask.name} - ${remainingCount}/${totalCount}`
		}

		assetsManager.onFinish = (tasks) => {
			let noerr = true
			tasks.forEach(task => {
				if (task.errorObject) console.log('task failed', task.errorObject.message, task.errorObject.exception)
				noerr = noerr && !task.errorObject
			})
			if (!noerr) {
				return
			}

			if (scene.isReady() && createScene) {
				createScene(scene, assets)
			} else if (createScene) {
				scene.onReadyObservable.addOnce((scene) => createScene(scene, assets))
			}

			engine.runRenderLoop(() => scene.render())
		}

		const resize = () => scene.getEngine().resize()
		window.addEventListener('resize', resize)

		assetsManager.load()

		return () => {
			scene.getEngine().dispose()
			window.removeEventListener('resize', resize)
		}
	}, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, navigate])

	return <canvas style={{ height: '100%', width: '100%' }} ref={reactCanvas} {...rest} />
}

export default () => <ClientOnly>{() => <Demo />}</ClientOnly>
