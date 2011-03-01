var outwords = new Array();  // the raw output
var shortdefpost = new Array();


var lastcolour = 0;

function postout(input,divclicked,frombox)
{
	outwords = [];
	shortdefpre = [];
	shortdefpost = [];
	
	divclicked = 'W'+divclicked;
	
	input = replacevelstandard(input);
	document.form.lastsearch.value=input;
	document.form.sped.selectedIndex=0;
	document.getElementById('anfs').innerHTML = '';

	if (document.getElementById(divclicked))
	{
		if (document.getElementById(lastcolour))
		{
			document.getElementById(lastcolour).style.color = colorcfg['coltext'];
			document.getElementById(lastcolour).style.fontWeight = 'normal';
		}
		document.getElementById(divclicked).style.color = colorcfg['colsel'];
		document.getElementById(divclicked).style.fontWeight = 'bold';
		lastcolour = divclicked;
	}

	var inputm = input.replace(/\u00B4/g, '"').replace(/xn/g, '"n');
	if(!frombox) { 
		document.form.dictin.value = replaceunistandard(inputm); // add to search box for editing
		document.form.manual.value = inputm; // add to search box for editing
	}

// --------------------------- start main function  ---------------------------------


	// ---------- housekeeping ----------
	
	input = input.replace(/\u00B7/g, '');
	input = input.replace(/\u00B4/g, '');
	input = input.replace(/"n/g, 'xn');
	//~ input = input.replace(/aa['"`]/g, 'a');
	//~ input = input.replace(/ii['"`]/g, 'i');
	//~ input = input.replace(/uu['"`]/g, 'u');
	input = input.replace(/[‘’“”`',{}?;!"-]/g, '');
	input = input.replace(/xn/g, '"n');
	input = input.toLowerCase();
	input = input.replace(/\.([^nmltd])/g, "$1");
	input = input.replace(/\.$/g, "");
	input = input.replace(/ .+/g, '');
		
	
	var manadd = [];
	
	manadd["devamanussaana,m"] = 'deva#1#manussaana,m';
	manadd["ukkaasitasaddo"] = 'ukkaasita#1#saddo';
	manadd["yaava~ncida,m"] = 'yaava#1#~nc#1#ida,m';

	shortdefpre = [];

	if (input.length > 1)  // ---------- dont waste time with periods and commas ----------
	{
		// ---------- Manual Add Routine ----------
		
		if (manadd[input]) { outwords.push(input + '$' + manadd[input]); }
		else { analyzeword(input); } // will populate outwords, which is nested array - 1) full alternative compounds/words seperated by array entry "space", 2) parts of the alt. compounds seperated by "@", 3) alt. defs of the parts, seperated by "#", 4) info for each alt. def. seperated by "^" 
	}
	if (outwords.length == 0)
	{
		outwords.push(input + '$0^' + input + '^3');
	}
	outputDef(0,1); // perform the function in linkout.js; 0 means first match, 1 means this is coming from linkin.js as opposed to the select box
	aw = 0;
	fm = 0;
}

var aw = 0;

function analyzeword (oneword, parts, partnames, shortdefpre, lastpart) {
	aw++;
	var matchedword;
	var fullmatch;
	var fullnames;
	
	if (!parts) { // first iteration
		parts = [];
		partnames = [];
		shortdefpre = [];
		matchedword = findmatch(oneword); // check for a single match
	}
	else if (oneword.length > 1) { matchedword = findmatch(oneword,lastpart); }  // check for an ending match
	
	if (matchedword) {
		fullnames = partnames.concat([matchedword[0]]);
		fullmatch = parts.concat([matchedword[1]]); // each part is a fake array of alt part defs, seperated by "#"
		outwords.push(fullnames.join('-') + '$' + fullmatch.join('@')); // only when we match the end of the compound do we add results, making a fake array of partnames and one of parts (if any).  Arrays are seperated by $
		if (matchedword[2]) {
			shortdefpost.push(shortdefpre.concat([matchedword[2]]).join('$')); 
		}
		else { shortdefpost.push(shortdefpre.join('$')); }
	}
	
	var partword;
	var restword;
	
	var nextparts;
	var nextpartnames;
	
	for (var j = 1; j < oneword.length; j++)
	{
		partword = oneword.substring(0,oneword.length-j);
		restword = oneword.substring(oneword.length-j,oneword.length);

		if (partword.length == 1 && (lastpart || partword != 'a')) { continue; } // no single letters, please

		var newpart = findmatch(partword,lastpart,restword); // check for matched part
		if (newpart) {
			nextparts = parts.concat(Array(newpart[1])); // add the part to our list of matched parts
			nextpartnames = partnames.concat(Array(newpart[0])); // add the part name to our list of matched part names
			analyzeword(restword, nextparts, nextpartnames, (newpart[2] ? shortdefpre.concat(newpart[2]) : shortdefpre), partword); // repeat passing the old parts to be added;
		}
		
	}
	// alert(parts + ' | ' + partnames + ' | ' + outwords);
}

// --------------------------- match finding function  ---------------------------------

var notpart = []; // disallowed compound words - 1 means totally, 2 means allowed only at the beginning;
notpart["ko"] = 1;
notpart["va"] = 1;
notpart["vaa"] = 1;
notpart["ya"] = 1;
notpart["da"] = 1;
notpart["hi"] = 1;
notpart["ha"] = 1;
notpart["ca"] = 1;
notpart["ma"] = 1;
notpart["la"] = 1;
notpart["nu"] = 1;
notpart["saa"] = 1;
notpart["saz1"] = 1;
notpart["saz2"] = 1;
notpart["saz4"] = 1;
notpart["suz1"] = 1;
notpart["suz2"] = 2;
notpart["suz3"] = 2;
notpart["aa"] = 2;
notpart["na"] = 1;
notpart["maa"] = 1;

var indeclinable = [];
indeclinable["na"] = 1;
//indeclinable["ca"] = 1;

var specsuf = new Array(); // once there is no match, we will cut off some suffixes and try again.
specsuf["~nca"] = '1/1501^~nca^0#ca';
specsuf["iiti"] = '0/3190^iiti^0#iti';
specsuf["pi"] = '2/2866^pi^0#pi';
specsuf["~nhi"] = '4/1234^~nhi^0#hi';
specsuf["va"] = '3/1047^va^0#va';
specsuf["eva"] = '0/4338^eva^0#eva';
specsuf["idha"] = '0/3208^idha^0#idha';

var fm = 0;


function findmatch(oneword,lastpart,nextpart,trick)
{
	var pra,prb,prc,prd,pre,prf;
	fm++;

	if (notpart[oneword]) { 
		if (notpart[oneword] == 1 && nextpart) { return null; }
		if (lastpart) { return null; }
	}
	
	//alert (oneword+' '+ lastpart);
	
	var cwt = [];

		
	// ---------- create wtr variables for alternative stem matching ----------
	
	
	for (var k = 0; k < oneword.length; k++) //define sub-cut for analysis (length-k,wt[i].length) and remaining string (0,length-k)
	{		
		cwt[k] = oneword.substring(oneword.length-k,oneword.length);				
	}
	
	
	// ---------- stem matching and converting ----------
	// this stuff is defined in declension.js
	
	var wtrN = []; // nouns, can be in compound
	var wtrV = []; // verbs, can't
	
	for (var pr = 0;pr < prem.length; pr++)
	{
		preach = prem[pr];
		pra = preach[0]; // ending to replace
		prb = pra.length; // size of ending
		prc = preach[1]; // find offset (positive means smaller cut)
		prd = preach[2]; // min. length for change
		pre = preach[3]; // new ending if any
		prf = preach[4]; // is a verb?

		if (prd == 0) prd = 1; // minimum one length

		if (cwt[prb] == pra && oneword.length > (prb + prd)) 
		{
			if (prf) { wtrV.push(oneword.substring(0, oneword.length-(prb-prc)) + pre); }
			else { wtrN.push(oneword.substring(0, oneword.length-(prb-prc)) + pre); }
		}
		
	}


	var res = [];
	var resn = [];
	var resy;

// exact maches

	if (mainda[oneword])
	{
		res.push(mainda[oneword]); 
	}
	else if (irregda[oneword]) {
		res.push(mainda[irregda[oneword]]);
	}
	
// multiple exacts
	
	if (res.length == 0) // no exact match, so we try exact matches that have a z# on the end
	{
		for (var a = 1; a < 10; a++) // loop through z1 - z6
		{				
			var temp = oneword + 'z' + a;
			if (mainda[temp]) 
			{
				res.push(mainda[temp]);
			}
			else break;
		}
	}

// concise matches
	
	var resy = '';

	if (yt[oneword]) 
	{					
		resy = oneword; // for matching the dictionary entry in the output
	}
	else if (irregda[oneword] && yt[irregda[oneword]]) {
		resy = irregda[oneword];
	}

	if(!lastpart && !nextpart) {
		 
// do this if non-compound

		// verbal & nominal declensions			
		
		var wtr = wtrN.concat(wtrV);

		if (res.length == 0) 
		{				
			for (var b = 0; b < wtr.length; b++) // check through wtr variants that we set at the beginning
			{			
				var temp = wtr[b];
				if (mainda[temp] != null && indeclinable[temp] == null) 
				{			
					res.push(mainda[temp]);				
				}
			}
		}
			
		if (res.length == 0) // if still no match, look for numbered variants
		{
			for (b = 0; b < wtr.length; b++) // b for alternative types wtr
			{							
				for (var c = 1; c < 10; c++) // c for numbers one to six
				{				
					var temp = wtr[b] + 'z' + c;

					if (mainda[temp]) 
					{
						res.push(mainda[temp]);
					}
					else { break; }
				}
			}
		}

	// concise variants

		if (!resy)
		{
			for (var b = 0; b < wtr.length; b++) // b for alternative types wtr
			{				

				var temp = wtr[b];
				
				if (yt[temp] && !resy && !indeclinable[temp]) 
				{					
					resy = temp; // for matching the dictionary entry in the output
				}						
			}
		}


	// DPPN matches
		for (var d = 1; d < 8; d++)
		{				
			var temp = oneword + 'f' + d; // remember that we have added f# to the end of all DPPN entries.  Here we add it to come up with wtnum
			if (nameda[temp]) 
			{					
				resn.push(nameda[temp]);
			}
			else { break; }
		}
		
		if (resn.length == 0)
		{
			for (var b = 0; b < wtr.length; b++) // b for alternative types wtr
			{				
				for (var d = 1; d < 10; d++)
				{				
					var temp = wtr[b] + 'f' + d;
					if (nameda[temp]) 
					{					
						resn.push(nameda[temp]);
					}
					else { break; }
				}
			}
		}
		
	// special suffixes

		if (res.length == 0 && resn.length == 0 && !resy)
		{

			for (var tempsuf = 5; tempsuf > 0; tempsuf--) {
				var cutsuf = oneword.substring(oneword.length - tempsuf);
				//
				if (specsuf[cutsuf]) {
					var desuf = findmatch(oneword.substring(0,oneword.length-tempsuf)); // run find function on desuffixed word
					if (desuf) {
						var outsuf =  Array(oneword.substring(0,oneword.length-tempsuf)+'-'+cutsuf, desuf[1] + '@'+ specsuf[cutsuf].split('#')[0], (desuf[2] ? desuf[2] + '$' : '') + specsuf[cutsuf].split('#')[1]); // manually add the two part "compound"
						return outsuf;
					}
				}
			}			
		}
	}


	if(nextpart) { 

// do this if compound part (not end)
	
		if (!lastpart) { // do this if first compound part
			if (!trick) {
				
				// adding the ` for special prefix only words
				
				var trickmatch = findmatch(oneword+'`',lastpart,nextpart,1);
				if (trickmatch) { return trickmatch; }
				
				// removing the 'm'
				
				if (oneword.charAt(oneword.length-1) == 'm') 
				{
					var trickmatch = findmatch(oneword.substring(0,oneword.length-1),lastpart,nextpart,1);
					if (trickmatch) { return Array(trickmatch[0] + '-m', trickmatch[1] + '@0^m^3', (trickmatch[2] ? trickmatch[2] : '') + '$'); } 
				}
			}
		}
	}
	else { 
		
// do this if compound end or non-compound
		
			
	}
	
	if(lastpart && !nextpart) {

// do this if compound end
	
		// nominal declensions			

		if (res.length == 0) 
		{				
			for (var b = 0; b < wtrN.length; b++) // check through wtrN variants that we set at the beginning
			{			
				var temp = wtrN[b];
				if (mainda[temp] != null && indeclinable[temp] == null) 
				{			
					res.push(mainda[temp]);				
				}
			}
		}
			
		if (res.length == 0) // if still no match, look for numbered variants
		{
			for (b = 0; b < wtrN.length; b++) // b for alternative types wtrN
			{							
				for (var c = 1; c < 10; c++) // c for numbers one to six
				{				
					var temp = wtrN[b] + 'z' + c;

					if (mainda[temp]) 
					{
						res.push(mainda[temp]);
					}
					else { break; }
				}
			}
		}

	// concise variants

		if (!resy)
		{
			for (var b = 0; b < wtrN.length; b++) // b for alternative types wtrN
			{				

				var temp = wtrN[b];
				
				if (yt[temp] && !resy && !indeclinable[temp]) 
				{					
					resy = temp; // for matching the dictionary entry in the output
				}						
			}
		}

	
	}	
	
	if(lastpart) { 

// do this if compound part or end

	// tricks
		if (res.length == 0 && resn.length == 0 && !resy && !trick) {
			var aiu1 = /[aiu]/.exec(oneword.charAt(0));
			var aiu2 = /[aiu]/.exec(oneword.charAt(1));
			var aiu3 = /[aiu]/.exec(lastpart.charAt(lastpart.length-1));
			

			if (aiu3 && ((!aiu1 && !aiu2) || oneword.charAt(0) == lastpart.charAt(lastpart.length-1)) && lastpart.length > 1) // check for shortened vowels, lengthen
			{
				if (!notpart[aiu3 + oneword]) {
					var trickmatch = findmatch(aiu3 + oneword,lastpart,nextpart,1);
					if (trickmatch) { return trickmatch; } 
				}
			}
			
			if (oneword.charAt(0) == oneword.charAt(1) && oneword.length > 3 && !aiu1 && oneword.charAt(0) != 'y') // check for consonant doubling - for maggappa.tipanno, gives magga-p-pa.tipanno
			{
				var trickmatch = findmatch(oneword.substring(1),lastpart,nextpart,1); // the 'pa.tipanno' in our example
				if (trickmatch) { return Array(oneword.charAt(0) + '-' + trickmatch[0], '0^' + oneword.charAt(0) + '^3@' + trickmatch[1], '$' + (trickmatch[2] ? trickmatch[2] : '')); } 
			}
		}
	}
	
	var altarray = [];

	if (res.length == 0 && resn.length == 0 && resy) { // only concise
		altarray.push('0^' + oneword.replace(/`$/,'') + '^2^' + resy);
	}
	else {
		if (res.length != 0) { for (var i in res) { altarray.push(res[i] + '^' + oneword.replace(/`$/,'') + '^0'+(resy ? '^'+resy:'')); } }
		if (resn.length != 0) { for (var j in resn) { altarray.push(resn[j] + '^' + oneword + '^1'+(resy ? '^'+resy:'')); } }
	}
	if(res.length == 0 && resn.length == 0 && !resy) { return null; }
	return(Array(oneword.replace(/`$/,''),altarray.join('#'),resy));  // add oneword to the beginning to let us put the word together later
}		
