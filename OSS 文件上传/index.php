<?php
/**
 * @Author: [FENG] <1161634940@qq.com>
 * @Date:   2019-07-07T09:23:43+08:00
 * @Last Modified by:   [FENG] <1161634940@qq.com>
 * @Last Modified time: 2019-07-07T09:39:38+08:00
 */

if (is_file(__DIR__ . '/../autoload.php')) {
    require_once __DIR__ . '/../autoload.php';
}
if (is_file(__DIR__ . './vendor/autoload.php')) {
    require_once __DIR__ . './vendor/autoload.php';
}

use OSS\OssClient;
use OSS\Core\OssException;

// 指定允许其他域名访问
$origin = isset($_SERVER['HTTP_ORIGIN'])? $_SERVER['HTTP_ORIGIN'] : '';
header('Access-Control-Allow-Origin:'.$origin);
// 响应类型
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
// 否允许发送Cookie
header('Access-Control-Allow-Credentials:true');
// 响应头设置
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept");

// 阿里云主账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM账号进行API访问或日常运维，请登录 https://ram.console.aliyun.com 创建RAM账号。
$accessKeyId = "<yourAccessKeyId>";
$accessKeySecret = "<yourAccessKeySecret>";

$endpoint = "http://oss-cn-hangzhou.aliyuncs.com"; // Endpoint以杭州为例，其它Region请按实际情况填写。
$bucket= "<yourBucketName>"; // 存储空间名称
$object = "<yourObjectName>"; // 文件名称
$path = ""; // 上传到OSS上面的文件路径 例如 ‘file/1111’ 路径前不用添加 ./

// <yourLocalFile>由本地文件路径加文件名包括后缀组成，例如/users/local/myfile.txt
// 本地图片的相对路径 或 上传服务器上的临时路径
// $filePath = "<yourLocalFile>";
$filePath = $_FILES["file"]["tmp_name"];

try{
    $ossClient = new OssClient($accessKeyId, $accessKeySecret, $endpoint);
    $ossClient->uploadFile($bucket, $path.$object, $filePath);
} catch(OssException $e) {
    printf(__FUNCTION__ . ": FAILED\n");
    printf($e->getMessage() . "\n");
    return;
}
print(__FUNCTION__ . ": OK" . "\n");
