<?php
/**
 * Файловый кэш графиков
 *
 * @package graph_cache
 * @author fuse
 * @since 14.05.12 15:01
 */
class Graph_Cache
{
    /** Время жизни кэша в секундах @var int */
    private $ttl;
    /** Путь для хранения файлового кэша @var string */
    private $cacheDir;
    /** Название файла (генерируется) @var string */
    private $filename;
    /** Расширение файла. По нему определяется тип файла @var string */
    private $ext;
    
    public function __construct(array $cacheParams)
    {
        $this->ttl = 60;
        $this->cacheDir = __DIR__ . '/cache/';
        $this->filename = md5(serialize($cacheParams));
        $this->ext = '.png';
    }
    
    /**
     * Устанавливает время жизни кэша в секундах
     * @param int $ttl
     */
    public function setTTL($ttl)
    {
        $this->ttl = $ttl;
    }
    
    /**
     * Устанавливает путь для хранения файлового кэша
     * @param string $dir
     */
    public function setCacheDir($dir)
    {
        $this->cacheDir = $dir;
    }
    
    /**
     * Устанавливает расширение файла
     * @param string $ext
     */
    public function setFileExt($ext)
    {
        $this->ext = $ext;
    }
    
    /**
     * Проверяет наличие и актуальность кэша
     * @return bool
     */
    public function check()
    {
        $cacheFile = $this->getFilename();
        return file_exists($cacheFile) && filemtime($cacheFile) >= (time() - $this->ttl);
    }

    /**
     * Возвращает путь к кэш-файлу
     * @return string
     */
    public function getFilename()
    {
        return $this->cacheDir . $this->filename . $this->ext;
    }
    
    /**
     * output
     * 
     */
    public function output()
    {
        $fh = fopen($this->getFilename(), "rb");
        header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        header("Last-Modified: " . gmdate("D, d M Y H:i:s") . "GMT");
        header("Cache-Control: no-cache, must-revalidate");
        header("Pragma: no-cache");
        header("Content-type: image/".ltrim($this->ext, '.'));
        fpassthru($fh);
    }
}
