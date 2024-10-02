<template>
  <div class="page-container">
		<div class="flex gap-3 p-2">
			<div class="flex-1">
				<h1 class="font-bold text-2xl text-center mb-2">
					Wave function collapse
				</h1>

				<div class="grid grid-cols-5 justify-between gap-y-2 rounded-md bg-gray-200 p-3 place-items-center">
						<b>Base Image</b>

						<b>Left border rules</b>

						<b>Top border rules</b>

						<b>Right border rules</b>

						<b>Bottom border rules</b>

					<template
						v-for="baseImageData in BASE_IMAGE_DATAS"
					>
						<img :src="baseImageData.url"/>

						<span>{{ stringifyImageBorderRules(baseImageData.imageSideInfo.left) }}</span>

						<span>{{ stringifyImageBorderRules(baseImageData.imageSideInfo.top) }}</span>

						<span>{{ stringifyImageBorderRules(baseImageData.imageSideInfo.right) }}</span>

						<span>{{ stringifyImageBorderRules(baseImageData.imageSideInfo.bottom) }}</span>
					</template>
				</div>
			</div>

			<div class="flex-1 max-h-[100vh]">
				<canvas
					ref="canvasElemRef"
					class="wave-function-collapse__canvas w-full h-full bg-gray-200"
					:width="CANVAS_WIDTH"
					:height="CANVAS_HEIGHT"
				>
					Your browser does not support canvas
				</canvas>
			</div>
		</div>
  </div>
</template>

<script>
import {
	useHead,
	ref,
	reactive,
	computed,
} from '#imports'

import { getRandomNumberFromRange } from '@/lib/utils/random.util.ts'

import { BASE_IMAGE_DATAS } from '@/lib/consts/image-data.const'

const CANVAS_WIDTH  = 1000;
const CANVAS_HEIGHT = 1000;

const COLUMN_COUNT = 25;
const ROW_COUNT = 25;

const CELL_WIDTH = CANVAS_WIDTH / COLUMN_COUNT;
const CELL_HEIGHT = CANVAS_HEIGHT / ROW_COUNT;

export default {
  name: 'WaveFunctionCollapsePage',
  setup() {
		useHead(
			{
				title: 'Wave function collapse',
				meta: [
					{
						name: 'description',
						value: 'This is wave function collapse page'
					}
				]
			}
		)

	  const canvasElemRef = ref(null)

	  const cellQueue = reactive([])
	  const cellsWithImage = reactive([])

	  const loadedImages = reactive(
			Array(BASE_IMAGE_DATAS.length)
				.fill(null)
	  )

	  const ctx = computed(
		  () => {
				if (!canvasElemRef.value) {
					return null
				}

				return canvasElemRef.value.getContext('2d')
		  }
	  )

	  function initPage() {
			cellQueue.unshift(
				[
					getRandomNumberFromRange(0, ROW_COUNT),
					getRandomNumberFromRange(0, COLUMN_COUNT),
				],

			)

		  setInterval(
				drawCanvasObjects,
			  15,
		  )
		}

		function drawCanvasObjects() {
			if (!ctx.value) {
				return;
			}

			if (cellQueue.length) {
				const cellCoords = cellQueue.pop();

				drawCell(ctx.value, cellsWithImage, cellCoords, CELL_WIDTH, CELL_HEIGHT)
				addCellNeighbours(cellQueue, cellCoords)
			}
		}

		function getNeighbours(queue, cellCoords, options = {}) {
			const {
				onlyProcessed
			} = options

			const neighbours = []

			const dirs = [
				[1, 0, 'top-bottom'],
				[0, -1, 'right-left'],
				[0, 1, 'left-right'],
				[-1, 0, 'bottom-top']
			]

			const [
				row,
				col
			] = cellCoords

			for (const [dr, dc, direction] of dirs) {
				let nr = row + dr;
				let nc = col + dc;

				const processedCell = cellsWithImage
					.find(
						cell => cell[0] === nr && cell[1] === nc
					)

				const isCellInQueue = queue
					.some(
						cellInfo => cellInfo[0] === nr && cellInfo[1] === nc
					)

				if (
					nr < 0
					|| nc < 0
					|| nr >= ROW_COUNT
					|| nc >= COLUMN_COUNT
					|| (!processedCell && onlyProcessed)
					|| (!!processedCell && !onlyProcessed)
					|| isCellInQueue
				) {
					continue
				}

				const cell = onlyProcessed
					? [
						...processedCell,
						direction
					]
					: [
						nr,
						nc
					]

				neighbours.push(cell)
			}

			return neighbours
		}

		function addCellNeighbours(queue, cellCoords) {
			const neighbours = getNeighbours(queue, cellCoords)

			queue.unshift(...neighbours)
		}

		function getSuitableImagesForCell(queue, cellCoords) {
			const neighbours = getNeighbours(
				queue,
				cellCoords,
				{
					onlyProcessed: true
				}
			)

			if (!neighbours.length) {
				return BASE_IMAGE_DATAS
					.map(
						(_, index) => index
					)
			}

			const suitableImages = new Set();

			for (const imageIndex in BASE_IMAGE_DATAS) {
				let isSuitable = true;

				for (const neighbour of neighbours) {
					const [
						neighbourDirection,
						cellDirection,
					] = neighbour[3].split('-')

					const imageData = BASE_IMAGE_DATAS[neighbour[2]].imageSideInfo[neighbourDirection]

					const image = BASE_IMAGE_DATAS[imageIndex]
					const data = image.imageSideInfo[cellDirection]

					for (const cIndex in data) {
						if (data[cIndex] !== imageData[cIndex]) {
							isSuitable = false;
							break;
						}
					}
				}

				if (isSuitable) {
					suitableImages.add(imageIndex)
				}
			}

			return Array.from(suitableImages)
		}

		function drawCell(ctx, processedCells, cellInfo, cellWidth, cellHeight) {
			const suitableImages = getSuitableImagesForCell(cellQueue, cellInfo)

			const row = cellInfo[0] * CELL_WIDTH
			const col = cellInfo[1] * CELL_HEIGHT

			let cellImageIndex = cellInfo[2]
				?? suitableImages[
					getRandomNumberFromRange(0, suitableImages.length)
				]

			if (cellInfo[2] === undefined) {
				processedCells.push(
					[
						...cellInfo,
						cellImageIndex
					]
				)
			}

			if (loadedImages[cellImageIndex]) {
				const image = loadedImages[cellImageIndex].url

				ctx.drawImage(image, col, row, cellWidth, cellHeight)
			}
			else {
				const image = new Image()

				image.src = BASE_IMAGE_DATAS[cellImageIndex].url

				image.onload = () => {
					ctx.drawImage(image, col, row, cellWidth, cellHeight)
				}
			}
		}

		function stringifyImageBorderRules(rules) {
			return rules
				.join('')
		}

		initPage()

    return {
			BASE_IMAGE_DATAS,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,

	    canvasElemRef,

			stringifyImageBorderRules
    }
  }
}
</script>

<style scoped lang="sass">
</style>
