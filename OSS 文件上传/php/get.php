<?php
/**
 * @Author: [FENG] <1161634940@qq.com>
 * @Date:   2020-06-23T15:08:17+08:00
 * @Last Modified by:   [FENG] <1161634940@qq.com>
 * @Last Modified time: 2020-06-25T17:14:22+08:00
 */

$config = [
    'id' => '', // 请填写您的AccessKeyId。
    'secret' => '', // 请填写您的AccessKeySecret。
    'bucket' => '', // 请填写您的Bucket
    'endpoint' => '', // 请填写您的Endpoint
    'callback' => '', // 回调地址
    'fileurl' => '', // cdn访问url
];

$config = array_filter($config);

if (count($config) < 5) {
    echo json_encode(['code'=>0,'msg'=>'请将配置填写完整']);
    die;
}

// $host的格式为 bucketname.endpoint，请替换为您的真实信息。
$host = 'https://'.$config['bucket'].'.'.$config['endpoint'];
// $callbackUrl为上传回调服务器的URL，请将下面的IP和Port配置为您自己的真实URL信息。
$callbackUrl = $config['callback'];
$dir = 'upload/'.date('Y').date('m').date('d').'/'; // 用户上传文件时指定的目录前缀。

$callback_param = array('callbackUrl'=>$callbackUrl,
             'callbackBody'=>'filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}',
             'callbackBodyType'=>"application/x-www-form-urlencoded");
$callback_string = json_encode($callback_param);

$base64_callback_body = base64_encode($callback_string);
$now = time();
$expire = 30;  //设置该policy超时时间是10s. 即这个policy过了这个有效时间，将不能访问。
$end = $now + $expire;
$expiration = date(DATE_ISO8601, $end);
$pos = strpos($expiration, '+');
$expiration = substr($expiration, 0, $pos);
$expiration .= "Z";

//最大文件大小.用户可以自己设置
$condition = array(0=>'content-length-range', 1=>0, 2=>1048576000);
$conditions[] = $condition;

// 表示用户上传的数据，必须是以$dir开始，不然上传会失败，这一步不是必须项，只是为了安全起见，防止用户通过policy上传到别人的目录。
$start = array(0=>'starts-with', 1=>'$key', 2=>$dir);
$conditions[] = $start;

$arr = array('expiration'=>$expiration,'conditions'=>$conditions);
$policy = json_encode($arr);
$base64_policy = base64_encode($policy);
$string_to_sign = $base64_policy;
$signature = base64_encode(hash_hmac('sha1', $string_to_sign, $config['secret'], true));

$response = array(
    'accessid' => $config['id'],
    'host' => $host,
    'policy' => $base64_policy,
    'signature' => $signature,
    'expire' => $end,
    'callback' => $base64_callback_body,
    'dir' => $dir,  // 这个参数是设置用户上传文件时指定的前缀
);

// echo json_encode($response);
echo json_encode(['code'=>1,'msg'=>'获取数据成功','data'=>$response]);
