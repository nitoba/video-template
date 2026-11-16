import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';

/** Posiciona a câmera a cada frame (determinístico, sem useFrame). */
export const CameraRig: React.FC<{position: [number, number, number]; lookAt: [number, number, number]; fov?: number; roll?: number}> = ({
	position,
	lookAt,
	fov,
	roll = 0,
}) => {
	const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
	useLayoutEffect(() => {
		camera.position.set(...position);
		camera.up.set(Math.sin(roll), Math.cos(roll), 0);
		camera.lookAt(...lookAt);
		if (fov !== undefined) camera.fov = fov;
		camera.updateProjectionMatrix();
	});
	return null;
};
