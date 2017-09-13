//Obscure TTS params
  function obscureTTSParams (v, s) {
         v = v.toLowerCase(); //get the voice in lower case
         s = s.replace (/\*/g, ''); //remove *s from the sentence
         var ttsinput = encodeURIComponent (cleverbot.obscureBase64String (v + cleverbot.ovalue, encodeURIComponent(v.substr(0,2)+s), 0, 1)); //get TTS input
         var showabit = s.replace (/\W/g, '').toLowerCase().substr(0,4); //show a bit of the sentence in the logs for us, but lower case and without punctuation 23/3/2015
         return 'voice=' + v + '&ss=' + showabit + '&senc=' + ttsinput; //the parameters for the TTS
 }


 //Javascript version of an obscuring function for base64
 //Copied from CleverbotLocal.cpp C code, see there for more comments, uses $ so can be copied to PHP as well
  function obscureBase64String ($keyp, $messagep, $decode, $urls) {
         if (cleverbot.debug >= 3) console.log ("Obscuring " + $messagep + " with " + $keyp);
         var $keyin=[]; for (var $i=0; $i<$keyp.length; $i++) $keyin.push ($keyp.charCodeAt($i)); $keyin.push (0); //turn into an array of integers
         var $message=[]; for (var $i=0; $i<$messagep.length; $i++) $message.push ($messagep.charCodeAt($i)); $message.push (0); //turn into an array of integers
         var $buffer=[], $key=[], $c, $kmod, $mmod, $buffersize, $klen, $mfulllen, $moffset, $mlen, $b, $m, $k, $c1, $c2; //declare variables for C and Javascript
         $kmod=17; $mmod=37; $buffersize=29; //prime numbers for looping through key and message, $mmod must be greater than $buffersize
         $c1=$urls?37:43; $c2=$urls?46:47; //if we are encoding URLs instead then do %=37 and .=46 as the extra two characters instead of +=43 and /=47
         //Count the length of the key while converting all it's characters from 0-63 by giving them their base64 equivalents or the number 63
         //Javascript requires characters as numbers so instead of 'A' and 'Z' 
         for ($klen=0;($c=$keyin[$klen])&&$klen<$kmod; $klen++) $key[$klen] = ($c>=65&&$c<=90) ? ($c-65) : ($c>=97&&$c<=122 ? ($c+26-122):($c>=48&&$c<=57?($c+52-48):63));
         for ($mfulllen=0; ($c=$message[$mfulllen]); $mfulllen++) {}; //get the length of the string, done this way so it's copyable to Javascript
         //Now loop through the message in chunks of mmod bytes, where mmod and buffersize are relatively prime (prime to each other)
         for ($moffset=0; $moffset<$mfulllen; $moffset+=$buffersize) { //loop through the message buffersize characters at a time
                 $mlen = $mfulllen - $moffset >= $buffersize ? $buffersize : ($mfulllen - $moffset); //how many characters in message we are working on this iteration
                 //debugMessage (1, "Encoding %2d characters of message from %2d\n", $mlen, $moffset);
                 for ($b=0, $k=$kmod, $m=$mmod; $b<$mlen; $b++, $k+=$kmod, $m+=$mmod) { //i is a counter, k loops through the key and m through the message
                         $c = $message[($decode?$b:($m%$mlen)) + $moffset]; //the character from the message we are looking at
                         //Check if a character is base64 or not, if it is not then just add 500 so we know. 
                         if (! (($c>=65&&$c<=90) || ($c>=97&&$c<=122) || ($c>=48&&$c<=57) || $c==$c1 || $c==$c2)) $c += 500; //not a base64 character
                         //Now make all base64 characters beween 0 and 63. So A-Z stay at 65-90, a-z stay at 97-122, 0-5 go from 48-53 to 91-96
                         //6-9 go from 54-57 to 123-126, + goes from 43 to 64 and / goes from 47 to 127. Then sustract by 64 to get from 0 to 63.
                         else $c = ($c>=48&&$c<=53 ? $c+43 : ($c>=54&&$c<=57 ? $c+69 : ($c==$c1 ? 64 : ($c==$c2 ? 127 : $c)))) - 64; //convert to 0-63
                         $buffer[$decode?($m%$mlen):$b] = $c>=500 ? $c : ($key[$k%$klen] ^ $c); //put into the buffer an encoded character 0-64 or non-encoded 500+
                 }
                 for ($b=0; $b<$mlen; $b++) { //loop through the characters just added
                         $c = $buffer[$b] + 64; //bring them up from 0-63 to 64-127 which puts the letters in the correct places, non base6$ are now 564++
                         $message[$b+$moffset] = $c>=500 ? ($c-500-64) : ($c>=91&&$c<=96 ? $c-43 : ($c>=123&&$c<=126 ? $c-69 : ($c==64 ? $c1 : ($c==127 ? $c2 : $c))));
                 }
         }
         $message.pop(); return String.fromCharCode.apply (String, $message); //remove the final 0 and create the string
 }
