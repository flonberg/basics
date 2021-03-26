<?php

require_once('REMOTEClass.inc');

class ERROR
{
	public function message($msg,$code,$severity,$data)
	{
		if($severity == 0)
		{
			return 0;
		}
		if($severity == 1)
		{
			$mtype = "INFO";
			$etype = 0;
		}
		if($severity == 2)
		{
			$mtype = "ALERT";
			$etype = 0;
		}
		if($severity == 3)
		{
			$mtype = "ERROR";
			$etype = 1;
		}
		if($severity > 3)
		{
			$mtype = "DEBUG";
			$etype = 0;
		}
		print "<html>\n";
		print "<title>Whiteboard $mtype - $code</title>\n";
		print "<body>\n";
		print "<h3>Whiteboard $mtype</h3>\n";
		print "Error Code: $code<br>\n";
		print "Error Message: $msg<br>\n";
		if(isset($data))
		{
			$this->debugData($data);
		}
		print "</body>\n";
		print "</html>\n";

		if($code%2 != 0)
		{
			print "EXITING<br>\n";
			exit(1);
		}
	}

	public function debugData($data)
	{
		print "<pre>\n";
		print_r($data);
		print "</pre>\n";
	}
}

class ESBDT
{
        public function esbtoday()
        {   
                $returndate = date('Y-m-d\TH:i:s\Z');
		return $returndate;
	}

        public function esbdate($mydate)
        {   
                if(!$mydate == "") 
                {   
                        $returndate = date('Y-m-d\TH:i:s\Z');
                }   
                else
                {   
			// assumes date formmat month/day/year. uses current hour and 00 seconmds

                        $datestr = preg_split('/\//',$mydate);
                        $hour = date('H');
                        $returndate = $datestr[2]."-".$datestr[0]."-".$datestr[1]."T".$hour.":00:00Z";
                }   
    
                return $returndate;
        }   

        public function convertDCMDate($dcmdate)
        {
                if($dcmdate == "")
                {
                        $returndate = date('Y-m-d\TH:i:s\Z');
                }
                else
                {
                        $year = substr($dcmdate,0,4);
                        $month = substr($dcmdate,4,2);
                        $day = substr($dcmdate,6,2);
                        $returndate = date('Y-m-d\TH:i:s\Z',mktime(0,0,0,$month,$day,(int)$year));
                }

                return $returndate;
        }

}

class UTIL
{
	public $wbpath = "H:\\inetpub\\wwwroot\\htdocs\\mqimages\\";
	public $webpath = "/mqimages/";

	public function makeImagePath($img)
	{
		$pattern = '/d01/';
		$replace = 'jpg';

		// print "IMG: $img<br>\n";
		$fname = basename($img);
		print "makeImagePath: $fname<br>\n";
		$jpegimg = preg_replace($pattern,$replace,$fname);
		$wbfile = $this->wbpath.$jpegimg;

		return $wbfile;
	}

	public function makeWebPath($img)
	{
		$pattern = '/d01/';
		$replace = 'jpg';

		// print "IMG: $img<br>\n";
		$fname = basename($img);
		print "makeImagePath: $fname<br>\n";
		$jpegimg = preg_replace($pattern,$replace,$fname);
		$wbfile = $this->webpath.$jpegimg;

		return $wbfile;
	}

	public function copyImagesToESB($mqimage, $esbimage)
	{
		$win = new WIN();

		// TODO: get credentials from file
		$win->username = "SU266";
		$win->password = "NTt19kps";
		$win->drvletter = 'J';
		$win->host = '\\\\phsmqdsp02.partners.org\\mosaiq_data$';


		$mnt = $win->mount();

		print_r($mnt);

		$path = explode('$',$mqimage);
		$mqpath = $win->drvletter.":".$path[1];
		print "MQPATH: $mqpath $esbimage<br>\n";
		$win->copy($mqpath,$esbimage);
	}



}

class ACCESS
{

	public function allowClient($key,$type)
	{
		global $client;

		require_once("allowedClientList.inc");

		$result = false;

		for($i=0;$i<count($client);$i++)
		{
			if(strpos($key,$client[$i]['ip']) !== false || strpos($key,$client[$i]['fqdn']) !== false)
			{
				if(strpos($type,$client[$i]['type']) !== false)
				{
					$result = true;
				}
			}
		}

		return $result;
	}
}


/**
  * RTF parser/formatter
  *
  * This code reads RTF files and formats the RTF data to HTML.
  *
  * PHP version 5
  *
  * @author     Alexander van Oostenrijk
  * @copyright  2014 Alexander van Oostenrijk
  * @license    GNU
  * @version    1
  * @link       http://www.independent-software.com
  * 
  * Sample of use:
  * 
  * $reader = new RtfReader();
  * $rtf = file_get_contents("itc.rtf"); // or use a string
  * $reader->Parse($rtf);
  * //$reader->root->dump(); // to see what the reader read
  * $formatter = new RtfHtml();
  * echo $formatter->Format($reader->root);   
  */

class RtfElement
{
  protected function Indent($level)
  {
    for($i = 0; $i < $level * 2; $i++) echo "&nbsp;";
  }
}

class RtfGroup extends RtfElement
{
  public $parent;
  public $children;

  public function __construct()
  {
    $this->parent = null;
    $this->children = array();
  }

  public function GetType()
  {
    // No children?
    if(sizeof($this->children) == 0) return null;
    // First child not a control word?
    $child = $this->children[0];
    if(get_class($child) != "RtfControlWord") return null;
    return $child->word;
  }    

  public function IsDestination()
  {
    // No children?
    if(sizeof($this->children) == 0) return null;
    // First child not a control symbol?
    $child = $this->children[0];
    if(get_class($child) != "RtfControlSymbol") return null;
    return $child->symbol == '*';
  }

  public function dump($level = 0)
  {
    echo "<div>";
    $this->Indent($level);
    echo "{";
    echo "</div>";

    foreach($this->children as $child)
    {
      if(get_class($child) == "RtfGroup")
      {
        if ($child->GetType() == "fonttbl") continue;
        if ($child->GetType() == "colortbl") continue;
        if ($child->GetType() == "stylesheet") continue;
        if ($child->GetType() == "info") continue;
        // Skip any pictures:
        if (substr($child->GetType(), 0, 4) == "pict") continue;
        if ($child->IsDestination()) continue;
      }
      $child->dump($level + 2);
    }

    echo "<div>";
    $this->Indent($level);
    echo "}";
    echo "</div>";
  }
}

class RtfControlWord extends RtfElement
{
  public $word;
  public $parameter;

  public function dump($level)
  {
    echo "<div style='color:green'>";
    $this->Indent($level);
    echo "WORD {$this->word} ({$this->parameter})";
    echo "</div>";
  }
}

class RtfControlSymbol extends RtfElement
{
  public $symbol;
  public $parameter = 0;

  public function dump($level)
  {
    echo "<div style='color:blue'>";
    $this->Indent($level);
    echo "SYMBOL {$this->symbol} ({$this->parameter})";
    echo "</div>";
  }    
}

class RtfText extends RtfElement
{
  public $text;

  public function dump($level)
  {
    echo "<div style='color:red'>";
    $this->Indent($level);
    echo "TEXT {$this->text}";
    echo "</div>";
  }    
}

class RtfReader
{
  public $root = null;

  protected function GetChar()
  {
    $this->char = $this->rtf[$this->pos++];
  }

  protected function ParseStartGroup()
  {
    // Store state of document on stack.
    $group = new RtfGroup();
    if($this->group != null) $group->parent = $this->group;
    if($this->root == null)
    {
      $this->group = $group;
      $this->root = $group;
    }
    else
    {
      array_push($this->group->children, $group);
      $this->group = $group;
    }
  }

  protected function is_letter()
  {
    if(ord($this->char) >= 65 && ord($this->char) <= 90) return TRUE;
    if(ord($this->char) >= 90 && ord($this->char) <= 122) return TRUE;
    return FALSE;
  }

  protected function is_digit()
  {
    if(ord($this->char) >= 48 && ord($this->char) <= 57) return TRUE;
    return FALSE;
  }

  protected function ParseEndGroup()
  {
    // Retrieve state of document from stack.
    $this->group = $this->group->parent;
  }

  protected function ParseControlWord()
  {
    $this->GetChar();
    $word = "";
    while($this->is_letter())
    {
      $word .= $this->char;
      $this->GetChar();
    }

    // Read parameter (if any) consisting of digits.
    // Paramater may be negative.
    $parameter = null;
    $negative = false;
    if($this->char == '-') 
    {
      $this->GetChar();
      $negative = true;
    }
    while($this->is_digit())
    {
      if($parameter == null) $parameter = 0;
      $parameter = $parameter * 10 + $this->char;
      $this->GetChar();
    }
    if($parameter === null) $parameter = 1;
    if($negative) $parameter = -$parameter;

    // If this is \u, then the parameter will be followed by 
    // a character.
    if($word == "u") 
    {
    }
    // If the current character is a space, then
    // it is a delimiter. It is consumed.
    // If it's not a space, then it's part of the next
    // item in the text, so put the character back.
    else
    {
      if($this->char != ' ') $this->pos--; 
    }

    $rtfword = new RtfControlWord();
    $rtfword->word = $word;
    $rtfword->parameter = $parameter;
    array_push($this->group->children, $rtfword);
  }

  protected function ParseControlSymbol()
  {
    // Read symbol (one character only).
    $this->GetChar();
    $symbol = $this->char;

    // Symbols ordinarily have no parameter. However, 
    // if this is \', then it is followed by a 2-digit hex-code:
    $parameter = 0;
    if($symbol == '\'')
    {
      $this->GetChar(); 
      $parameter = $this->char;
      $this->GetChar(); 
      $parameter = hexdec($parameter . $this->char);
    }

    $rtfsymbol = new RtfControlSymbol();
    $rtfsymbol->symbol = $symbol;
    $rtfsymbol->parameter = $parameter;
    array_push($this->group->children, $rtfsymbol);
  }

  protected function ParseControl()
  {
    // Beginning of an RTF control word or control symbol.
    // Look ahead by one character to see if it starts with
    // a letter (control world) or another symbol (control symbol):
    $this->GetChar();
    $this->pos--;
    if($this->is_letter()) 
      $this->ParseControlWord();
    else
      $this->ParseControlSymbol();
  }

  protected function ParseText()
  {
    // Parse plain text up to backslash or brace,
    // unless escaped.
    $text = "";

    do
    {
      $terminate = false;
      $escape = false;

      // Is this an escape?
      if($this->char == '\\')
      {
        // Perform lookahead to see if this
        // is really an escape sequence.
        $this->GetChar();
        switch($this->char)
        {
          case '\\': $text .= '\\'; break;
          case '{': $text .= '{'; break;
          case '}': $text .= '}'; break;
          default:
            // Not an escape. Roll back.
            $this->pos = $this->pos - 2;
            $terminate = true;
            break;
        }
      }
      else if($this->char == '{' || $this->char == '}')
      {
        $this->pos--;
        $terminate = true;
      }

      if(!$terminate && !$escape)
      {
        $text .= $this->char;
        $this->GetChar();
      }
    }
    while(!$terminate && $this->pos < $this->len);

    $rtftext = new RtfText();
    $rtftext->text = $text;
    array_push($this->group->children, $rtftext);
  }

  public function Parse($rtf)
  {
    $this->rtf = $rtf;
    $this->pos = 0;
    $this->len = strlen($this->rtf);
    $this->group = null;
    $this->root = null;

    while($this->pos < $this->len)
    {
      // Read next character:
      $this->GetChar();

      // Ignore \r and \n
      if($this->char == "\n" || $this->char == "\r") continue;

      // What type of character is this?
      switch($this->char)
      {
        case '{':
          $this->ParseStartGroup();
          break;
        case '}':
          $this->ParseEndGroup();
          break;
        case '\\':
          $this->ParseControl();
          break;
        default:
          $this->ParseText();
          break;
      }
    }
  }
}

class RtfState
{
  public function __construct()
  {
    $this->Reset();
  }

  public function Reset()
  {
    $this->bold = false;
    $this->italic = false;
    $this->underline = false;
    $this->end_underline = false;
    $this->strike = false;
    $this->hidden = false;
    $this->fontsize = 20;
  }
}

class RtfHtml
{
  public function Format($root)
  {
    $this->output = "";
    // Create a stack of states:
    $this->states = array();
    // Put an initial standard state onto the stack:
    $this->state = new RtfState();
    array_push($this->states, $this->state);
    $this->FormatGroup($root);
    return $this->output;
    // return $root->text;
  }

  protected function FormatGroup($group)
  {
    // Can we ignore this group?
    if ($group->GetType() == "fonttbl") return;
    if ($group->GetType() == "colortbl") return;
    if ($group->GetType() == "stylesheet") return;
    if ($group->GetType() == "info") return;
    // Skip any pictures:
    if (substr($group->GetType(), 0, 4) == "pict") return;
    if ($group->IsDestination()) return;

    // Push a new state onto the stack:
    $this->state = clone $this->state;
    array_push($this->states, $this->state);

    foreach($group->children as $child)
    {
      if(get_class($child) == "RtfGroup") $this->FormatGroup($child);
      if(get_class($child) == "RtfControlWord") $this->FormatControlWord($child);
      if(get_class($child) == "RtfControlSymbol") $this->FormatControlSymbol($child);
      if(get_class($child) == "RtfText") $this->FormatText($child);
    }

    // Pop state from stack.
    array_pop($this->states);
    $this->state = $this->states[sizeof($this->states)-1];
  }

  protected function FormatControlWord($word)
  {
    if($word->word == "plain") $this->state->Reset();
    if($word->word == "b") $this->state->bold = $word->parameter;
    if($word->word == "i") $this->state->italic = $word->parameter;
    if($word->word == "ul") $this->state->underline = $word->parameter;
    if($word->word == "ulnone") $this->state->end_underline = $word->parameter;
    if($word->word == "strike") $this->state->strike = $word->parameter;
    if($word->word == "v") $this->state->hidden = $word->parameter;
    //if($word->word == "fs") $this->state->fontsize = ceil(($word->parameter / 24) * 16);
    if($word->word == "fs") $this->state->fontsize = $this->fontsize;

    if($word->word == "par") $this->output .= "<br>";

    // Characters:
    if($word->word == "lquote") $this->output .= "&lsquo;";
    if($word->word == "rquote") $this->output .= "&rsquo;";
    if($word->word == "ldblquote") $this->output .= "&ldquo;";
    if($word->word == "rdblquote") $this->output .= "&rdquo;";
    if($word->word == "emdash") $this->output .= "&mdash;";
    if($word->word == "endash") $this->output .= "&ndash;";
    if($word->word == "bullet") $this->output .= "&bull;";
    if($word->word == "u") $this->output .= "&loz;";
  }

  protected function BeginState()
  {
    $span = "";
    if($this->state->bold) $span .= "font-weight:bold;";
    if($this->state->italic) $span .= "font-style:italic;";
    if($this->state->underline) $span .= "text-decoration:underline;";
    if($this->state->end_underline) $span .= "text-decoration:none;";
    if($this->state->strike) $span .= "text-decoration:strikethrough;";
    if($this->state->hidden) $span .= "display:none;";
    if($this->state->fontsize != 0) $span .= "font-size: {$this->state->fontsize}px;";
    $this->output .= "<span style='{$span}'>";
  }

  protected function EndState()
  {
    $this->output .= "</span>";
  }

  protected function FormatControlSymbol($symbol)
  {
    if($symbol->symbol == '\'')
    {
      $this->BeginState();
      $this->output .= htmlentities(chr($symbol->parameter), ENT_QUOTES, 'ISO-8859-1');
      $this->EndState();
    }
  }

  protected function FormatText($text)
  {
    $this->BeginState();
    $this->output .= $text->text;
    $this->EndState();
  }
}





?>
