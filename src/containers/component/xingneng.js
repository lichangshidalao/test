import React, { Component } from 'react';
import * as Cesium from "cesium/Cesium";
import viewerInit from "../CesiumViewer/viewer";
import { addTdtMap } from "../CesiumViewer/addTdtMap";
import { Button } from 'antd';
import './viewer.css';
// import treesmodel from '../../data/shu.glb'


//const viewer
let viewer
class Map extends Component {
    constructor() {
        super()
        this.state = {
            buttonstatus: true,
            number: 0,
            lineNumber: 0,
            modelT: 0
        }
    }
    componentDidMount() {
        viewer = viewerInit(this.refs.map)
    }
    handclick() {
        this.setState({
            number: this.state.number + 1
        })
        let pArray = [], cArray = [], idArray = []
        for (let i = 0; i < 50000; i++) {
            let cartesian3 = Cesium.Cartesian3.fromDegrees(Math.random() * 100, Math.random() * 100, Math.random() * 1000)
            pArray.push(cartesian3.x)
            pArray.push(cartesian3.y)
            pArray.push(cartesian3.z)
            cArray.push(Math.random())
            cArray.push(Math.random())
            cArray.push(Math.random())
            cArray.push(1)
            idArray.push(i)
        }
        //Float64Array Float32Array Uint16Array
        let pointArray = CreateGeometry(new Float64Array(pArray), new Float32Array(cArray), new Uint16Array(idArray))
        let instance = new Cesium.GeometryInstance({
            geometry: pointArray
        });
        let vertexShader = getVS();
        let fragmentShader = getFS();
        let appearance = CreateAppearence(fragmentShader, vertexShader)
        viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: instance,
            // appearance: new Cesium.MaterialAppearance({
            //     material: Cesium.Material.fromType('Color'),
            //     faceForward: true
            // }),
            appearance: appearance,
            asynchronous: false
        }));
    }
    //线性能测试
    handclickLine() {
        this.setState({
            lineNumber: this.state.lineNumber + 1
        })
        let pData = []
        for (let i = 0; i < 10000; i++) {
            let cartesian3 = Cesium.Cartesian3.fromDegrees(Math.random() * 100, Math.random() * 100, 1000)
            pData.push(cartesian3)
        }
        viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolylineGeometry({
                    positions: pData,
                    width: 10.0,
                    vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
                }),
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
                }
            }),
            appearance: new Cesium.PolylineColorAppearance({
                translucent: false
            })
        }));
    }
    //模型性能测试
    handclickModel() {
        this.setState({
            modelT: this.state.modelT + 1
        })
        for (let i = 0; i < 5000; i++) {
            let cartesian3 = Cesium.Cartesian3.fromDegrees(Math.random() * 100, Math.random() * 100, 1000)
            let entiss = viewer.entities.add({
                name: "trees",
                position: cartesian3,
                model: {
                    uri: "http://localhost:8080/Apps/SampleData/shu.glb",
                },
                scale: 10
            });
            if(i==0){
                viewer.zoomTo(entiss)
            }
        }
    }
    render() {
        return (
            <div className="map-image" ref="map" id="cesiumContain">
                <Button className="baiduButton" onClick={this.handclick.bind(this)}>{this.state.number > 0 ? this.state.number : "点"}</Button>
                <Button className="baiduButton2" onClick={this.handclickLine.bind(this)}>{this.state.lineNumber > 0 ? this.state.lineNumber : "线"}</Button>
                <Button className="baiduButton3" onClick={this.handclickModel.bind(this)}>{this.state.modelT > 0 ? this.state.modelT : "模型"}</Button>
            </div>
        );
    }
}
function CreateGeometry(positions, colors, indices) {
    return new Cesium.Geometry({
        attributes: {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: positions
            }),
            color: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 4,
                values: colors
            })
        },
        indices: indices,
        primitiveType: Cesium.PrimitiveType.POINTS,
        boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
    });
}

function CreateAppearence(fs, vs) {
    return new Cesium.Appearance({
        renderState: {
            blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,
            depthTest: { enabled: true },
            depthMask: true
        },
        fragmentShaderSource: fs,
        vertexShaderSource: vs
    });
}

function getVS() {
    return "attribute vec3 position3DHigh;\
    attribute vec3 position3DLow;\
    attribute vec4 color;\
    varying vec4 v_color;\
    attribute float batchId;\
    void main()\
    {\
        vec4 p = czm_computePosition();\
        v_color =color;\
        p = czm_modelViewProjectionRelativeToEye * p;\
        gl_Position = p;\
        gl_PointSize=8.0;\
    }\
    ";
}
function getFS() {
    return "varying vec4 v_color;\
    void main()\
    {\
         float d = distance(gl_PointCoord, vec2(0.5,0.5));\
         if(d < 0.5){\
            gl_FragColor = v_color;\
         }else{\
            discard;\
         }\
    }\
    ";
}
export default Map