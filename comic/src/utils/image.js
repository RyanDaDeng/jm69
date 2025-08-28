import { calculateMD5 } from '@/api/crypto'

function getSliceCount(comicId, page) {
  if (comicId >= 220980 && comicId < 268850) {
    return 10
  }

  const hashData = calculateMD5(comicId + page)
  let key = hashData.charCodeAt(hashData.length - 1)

  if (comicId >= 268850 && comicId <= 421925) {
    key = key % 10
  } else {
    key = key % 8
  }

  return key >= 0 && key <= 9 ? key * 2 + 2 : 10
}

export function cutImage(image, comicId, page) {
  if (comicId < 220980 || image.src.includes('.gif')) {
    return image
  }

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const sliceCount = getSliceCount(comicId, page)
  const sliceHeight = Math.floor(canvas.height / sliceCount)
  const remainingHeight = canvas.height % sliceCount

  // Move last slice to top
  context.drawImage(
    image,
    0,
    canvas.height - sliceHeight - remainingHeight,
    canvas.width,
    sliceHeight + remainingHeight,
    0,
    0,
    canvas.width,
    sliceHeight + remainingHeight
  )

  // Draw remaining slices in reverse order
  for (let i = 0; i < sliceCount - 1; i++) {
    context.drawImage(
      image,
      0,
      sliceHeight * (sliceCount - i - 2),
      canvas.width,
      sliceHeight,
      0,
      (i + 1) * sliceHeight + remainingHeight,
      canvas.width,
      sliceHeight
    )
  }

  return canvas
}

export function getImageUrl(imgServer, comicId, imageName) {
  // imgServer already includes protocol (https://)
  return `${imgServer}/media/photos/${comicId}/${imageName}`
}

export function getMaxRequestCount() {
  const currentHour = new Date().getHours()
  
  if (currentHour <= 3 || currentHour >= 21) {
    return 1
  } else if (currentHour >= 18) {
    return 3
  }
  return 5
}