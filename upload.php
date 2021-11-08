<?php
require 'vendor/autoload.php';
error_reporting(1);
define("CURRENT_PATH", str_replace("\\", "/", getcwd())); 
define("TEMP_PATH", "/temp/");
//define("FFMPEG_PATH", "usr\\\\ffmpeg\\\\bin\\\\ffmpeg.exe");
define("FFMPEG_PATH", "usr//local//Cellar//ffmpeg//4.4_1//bin//ffmpeg");
//define("CURL_PATH", "C:\\Windows\\System32\\curl.exe");

	$file = $_FILES['audiofile'];
	$allowedExts = array("mp3", "wav");
	$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
	if (($file['type'] == "audio/mp3" || $file['type'] == "audio/wav" || $file['type'] == "audio/mpeg") 
		&& $file['size'] < 10000000 && in_array($extension, $allowedExts)) 
	{
		$audioFile = new \Verot\Upload\Upload($file);
    	if ($audioFile->uploaded) {

		$audioFile->file_new_name_body = ReplaceName($audioFile->file_src_name_body);
		
		if (!is_dir(CURRENT_PATH.TEMP_PATH)) {
			mkdir(CURRENT_PATH.TEMP_PATH, 0755, true);
		}
		
		$fileName = $file['name'];
		$fileNameWithoutExtension = "";
		$fileNameWithoutExtensionArray = explode(".", $fileName);
		for ($i = 0; $i <= count($fileNameWithoutExtensionArray) - 2; $i++)
			$fileNameWithoutExtension .= $fileNameWithoutExtensionArray[$i];
		
		$replacedFileNameWithoutExtension = ReplaceName($fileNameWithoutExtension);
		
		if (!is_dir(CURRENT_PATH.TEMP_PATH.$replacedFileNameWithoutExtension)) {
			mkdir(CURRENT_PATH.TEMP_PATH.$replacedFileNameWithoutExtension, 0755, true);
		}
		
		$fullPath = CURRENT_PATH.TEMP_PATH.$replacedFileNameWithoutExtension;

        // upload klasörüne değişiklik yapmadan kayıt et
        $audioFile->Process($fullPath);

        if ($audioFile->processed){
			$audioFileName = ReplaceName($audioFile->file_dst_name);
			$audioFileNameExplode = explode(".", $audioFileName);
			$audioFileNameWithoutExtension = "";
			for ($i = 0; $i <= count($audioFileNameExplode) -2; $i++)
				$audioFileNameWithoutExtension .= $audioFileNameExplode[$i];
			
			$fullPathFile = CURRENT_PATH.TEMP_PATH.$replacedFileNameWithoutExtension."/".$audioFileName; // C:/AppServ/www/blobmp3/temp/piano_aaa_bbb_ccc_ddd/piano-aaa-bbb-ccc-ddd_3.mp3
			
			if (!is_dir($fullPath."/nftfiles/")) {
				mkdir($fullPath."/nftfiles/", 0755, true);
			}
			
			if (!is_dir($fullPath."/cropped/")) {
				mkdir($fullPath."/cropped/", 0755, true);
			}
			echo "0xs";

			$chunkFilesPath = $fullPath."/nftfiles/";
			
			$cropFilePath = $fullPath."/cropped/";
			
			$fullPathFileM3u8 = $chunkFilesPath.$audioFileNameWithoutExtension.".m3u8";
			
			$fullPathFileMp330Seconds = $cropFilePath.$audioFileNameWithoutExtension.".mp3";
			echo "1";

			$convertToM3u8Cmd = FFMPEG_PATH." -i ".$fullPathFile." -c:a aac -b:a 64k -vn -hls_list_size 0 ".$fullPathFileM3u8." &";

			echo "2";
			shell_exec($convertToM3u8Cmd);
						
			echo "23";

			$convertToMp3First30SecondsCmd = FFMPEG_PATH." -t 30 -i ".$fullPathFile." -acodec copy ".$fullPathFileMp330Seconds." &";
			
			echo "44";
			
			shell_exec($convertToMp3First30SecondsCmd);
						
			echo "55";

			/*
			$ch = curl_init();

			curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/?filePath='.$replacedFileNameWithoutExtension.'\\nftfiles&fileName='.$replacedFileNameWithoutExtension);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
			
			$headers = array();
			$headers[] = '‘Cache-Control: ';
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			
			$result = curl_exec($ch);
			if (curl_errno($ch)) {
			    echo 'Error:' . curl_error($ch);
			}
			curl_close($ch);
			
			$resultJson = json_decode($result);

			sleep(3);
			
			$ch = curl_init();
			
			curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/previewupload/?filePath='.$replacedFileNameWithoutExtension.'\\cropped&fileName='.$replacedFileNameWithoutExtension);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
			
			$headers = array();
			$headers[] = '‘Cache-Control: ';
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			
			$result = curl_exec($ch);
			if (curl_errno($ch)) {
			    echo 'Error:' . curl_error($ch);
			}
			curl_close($ch);
			
			$resultJson2 = json_decode($result);
			
			if ($resultJson->IpfsHash != null && $resultJson2->IpfsHash != null) {
				$returnMsg->Cid = $resultJson->IpfsHash;
				$returnMsg->Name = $replacedFileNameWithoutExtension;
				$returnMsg->M3u8Link = "https://gateway.pinata.cloud/ipfs/".$resultJson->IpfsHash."/nftfiles/".$audioFileNameWithoutExtension.".m3u8&cid=".$resultJson2->IpfsHash;
				Delete($fullPath);
				echo json_encode($returnMsg);
			}
			else {
				$returnMsg->errorCode = "101";
				$returnMsg->errorMsg = "Upload Error.";
				echo json_encode($returnMsg);
			}                 
        } else {
            	$returnMsg->errorCode = "102";
				$returnMsg->errorMsg = "Upload Error.";
				echo json_encode($returnMsg);
        }

    }
	}
	else 
	{
		$returnMsg->errorCode = "100";
		$returnMsg->errorMsg = "Invalid file type.";
		echo json_encode($returnMsg);
	}

function Delete($path)
{
    if (is_dir($path) === true)
    {
        $files = array_diff(scandir($path), array('.', '..'));

        foreach ($files as $file)
        {
            Delete(realpath($path) . '/' . $file);
        }

        return rmdir($path);
    }

    else if (is_file($path) === true)
    {
        return unlink($path);
    }

    return false;
}

function ReplaceName($string)
{
	$turkish = array("ı", "ğ", "ü", "ş", "ö", "ç", "İ", "Ğ", "Ü", "Ş", "Ö", "Ç");//turkish letters
	$english   = array("i", "g", "u", "s", "o", "c", "I", "G", "U", "S", "O", "C");//english cooridinators letters

	$final_name = str_replace($turkish, $english, strtolower($string));

	$result = preg_replace('/[^a-zA-Z0-9_.]/', '', $final_name);

	return $result;
}

?>