'use client'

import { useCallback, useState } from 'react'
import Cropper, { Point, Area } from 'react-easy-crop'

interface PhotoUploadProps {
    onSave: (croppedImage: string) => void
    onCancel: () => void
}

export function PhotoUpload({ onSave, onCancel }: PhotoUploadProps) {
    const [imageSrc, setImageSrc] = useState<string>('')
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [error, setError] = useState<string>('')

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError('')
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0]

                if (!file.type.startsWith('image/')) {
                    setError('Por favor, selecione uma imagem válida')
                    return
                }

                if (file.size > 5 * 1024 * 1024) {
                    setError('A imagem deve ter no máximo 5MB')
                    return
                }

                const imageUrl = URL.createObjectURL(file)
                setImageSrc(imageUrl)
            }
        } catch (err) {
            console.error('Erro ao processar arquivo:', err)
            setError('Erro ao processar a imagem. Tente novamente.')
        }
    }

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!croppedAreaPixels || !imageSrc) {
            setError('Por favor, selecione e ajuste a imagem primeiro')
            return
        }

        try {
            const image = new Image()
            image.src = imageSrc
            await new Promise((resolve) => {
                image.onload = resolve
            })

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const size = 400
            canvas.width = size
            canvas.height = size

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                size,
                size
            )

            const croppedImage = canvas.toDataURL('image/jpeg', 0.8)
            onSave(croppedImage)
        } catch (err) {
            console.error('Erro ao processar imagem:', err)
            setError('Erro ao processar a imagem. Tente novamente.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border border-primary/20 rounded-lg p-6 w-full max-w-xl">
                <h3 className="text-xl font-semibold text-primary mb-4">
                    Atualizar foto do perfil
                </h3>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-2 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {!imageSrc ? (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 rounded-lg">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onFileChange}
                            className="hidden"
                            id="photo-upload"
                        />
                        <label
                            htmlFor="photo-upload"
                            className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                            Selecionar foto
                        </label>
                    </div>
                ) : (
                    <>
                        <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden h-[300px]">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onCancel}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-primary hover:bg-primary/90 text-black font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
