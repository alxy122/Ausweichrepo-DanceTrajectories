/**
 * Fetches an XML document from the specified file path, parses it, and returns the parsed XML document.
 * 
 * @param filePath - The path to the XML file to be fetched and parsed.
 * @returns A Promise that resolves to the parsed XML document.
 * @throws An error if fetching the XML file fails or if the XML is not well-formed.
 */
async function fetchXML(filePath: string): Promise<Document> {
    try {
        const response = await fetch(filePath);
    
        if (!response.ok) {
            throw new Error("Failed to fetch XML file");
        }
    
        const xmlString = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('XML parsing error: The XML is not well-formed.');
        }
    
        return xmlDoc;
    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
        throw error;
    }
}

/**
 * Parses an XML document containing interpolated formation data and returns an array of interpolated formation data for each frame.
 * 
 * @param filePath - The path to the XML file containing interpolated formation data.
 * @returns A Promise that resolves to an array of interpolated formation data for each frame and dancer.
 */
export async function traverseInterpolatedFormations(filePath:string):Promise<number[][][]>{
    const xmlDoc=await fetchXML(filePath);
    const rootElement = xmlDoc.documentElement;
    let formationData: number[][][]=[];

    rootElement.childNodes.forEach(node=>{
        if(node.nodeName == "object") {
            let helper : number[][]=[];
            node.childNodes[0].childNodes.forEach(pos=>{
                if(pos.nodeName == "dancerPos") {
                    const pos2=pos as Element;
                    const x = parseFloat(pos2.attributes.getNamedItem("x")?.value ?? "0");
                    const y = parseFloat(pos2.attributes.getNamedItem("y")?.value ?? "0");
                    helper.push([-x, -y]);
                }
            })
            formationData.push(helper)
        }
    })
    return formationData;
}

/**
 * Parses an XML document containing trajectory data for dancers and returns a 2D array with bounding box information.
 * 
 * @param filePath - The path to the XML file containing trajectory data.
 * @returns A Promise that resolves to a 2D array of bounding box information for dancers.
 */
export async function traverseTrajectoriesXMLDocument (filePath: string):Promise<number[][][]>{
    const xmlDoc=await fetchXML(filePath);
    const rootElement = xmlDoc.documentElement;
    const dancers = rootElement.childNodes[3].childNodes[1].childNodes;
    const dancerData: number[][][]=[];
  
    dancers.forEach(dancer=>{
        if(dancer.nodeName == "object") {
            var helper : number[][]=[];
            dancer.childNodes[1].childNodes.forEach(bbox=>{
                if(bbox.nodeName == "data:bbox") {
                    const bbox2 = bbox as Element;
                    // console.log(bbox2.attributes.getNamedItem("framespan")?.value)
                    const x = parseInt(bbox2.attributes.getNamedItem("x")?.value ?? "0");
                    const y = parseInt(bbox2.attributes.getNamedItem("y")?.value ?? "0");
                    const width = parseInt(bbox2.attributes.getNamedItem("width")?.value ?? "0");
                    const height = parseInt(bbox2.attributes.getNamedItem("height")?.value ?? "0");
                    const middleOfBottomEdge = x+width/2
                    var span = bbox2.attributes.getNamedItem("framespan")?.value as string
                    var frames=parseInt(span.split(":",2)[1])-parseInt(span.split(":",2)[0])
                    for (var i=0;i<=frames;i=i+1){
                        helper.push([x, y, width, height,middleOfBottomEdge]);
                    }
                    
                }
            })
            dancerData.push(helper);
        }
    })
    return dancerData;
}

export async function traverseTransformedTrajectoriesXMLDocument (filePath: string):Promise<number[][][]>{
    const xmlDoc=await fetchXML(filePath);
    const rootElement = xmlDoc.documentElement;
    const dancers = rootElement.childNodes[3].childNodes[1].childNodes;
    const dancerData: number[][][]=[];
  
    dancers.forEach(dancer=>{
        if(dancer.nodeName == "ns0:object") {
            var helper : number[][]=[];
            dancer.childNodes[1].childNodes.forEach(bbox=>{
                if(bbox.nodeName == "ns1:bbox") {
                    const bbox2 = bbox as Element;
                    const x = parseFloat(bbox2.attributes.getNamedItem("x")?.value ?? "0");
                    const y = parseFloat(bbox2.attributes.getNamedItem("y")?.value ?? "0");
                    var span = bbox2.attributes.getNamedItem("framespan")?.value as string
                    var frames=parseInt(span.split(":",2)[1])-parseInt(span.split(":",2)[0])
                    for (var i=0;i<=frames;i=i+1){
                        helper.push([x, y]);
                    }
                    // console.log(parseInt(span.split(":",2)[1])-parseInt(span.split(":",2)[0]))
                    
                }
            })
            dancerData.push(helper);
        }
    })
    console.log(dancerData)
    return dancerData;
}

