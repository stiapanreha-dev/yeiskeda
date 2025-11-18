const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Middleware для автоматической обработки загруженных изображений
 * Конвертирует любое изображение в оптимальный формат и размер
 */
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const file = req.file;
    const originalPath = file.path;

    // Определяем целевой формат и размеры
    const outputFormat = 'jpeg'; // Можно изменить на 'webp' для еще лучшего сжатия
    const maxWidth = 800;
    const maxHeight = 600;
    const quality = 85; // Качество сжатия (1-100)

    // Новое имя файла с правильным расширением
    const parsedPath = path.parse(originalPath);
    const newFileName = `${parsedPath.name}.${outputFormat}`;
    const newPath = path.join(parsedPath.dir, newFileName);

    // Если новый путь совпадает с оригинальным, используем временный файл
    const tempPath = path.join(parsedPath.dir, `temp-${parsedPath.name}.${outputFormat}`);
    const outputPath = originalPath === newPath ? tempPath : newPath;

    // Обработка изображения с помощью sharp
    await sharp(originalPath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside', // Сохраняет пропорции, вписывая в указанные размеры
        withoutEnlargement: true // Не увеличивает маленькие изображения
      })
      .jpeg({ quality }) // Конвертируем в JPEG с указанным качеством
      .toFile(outputPath);

    // Если использовали временный файл, заменяем им оригинал
    if (outputPath === tempPath) {
      fs.unlinkSync(originalPath);
      fs.renameSync(tempPath, newPath);
    } else if (originalPath !== newPath) {
      // Удаляем оригинальный файл, если он отличается от обработанного
      fs.unlinkSync(originalPath);
    }

    // Обновляем информацию о файле в req.file
    req.file.path = newPath;
    req.file.filename = newFileName;
    req.file.mimetype = `image/${outputFormat}`;

    console.log(`✓ Изображение обработано: ${file.originalname} → ${newFileName}`);
    next();
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error);
    // Удаляем загруженный файл в случае ошибки
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Ошибка при обработке изображения'
    });
  }
};

module.exports = processImage;
