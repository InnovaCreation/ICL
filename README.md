# ICL

Innova Creation's Minecraft Launcher

# How to use/build/test

This product is **still** in heavy **development stage**. It is not for using right now.

If you want to test this project, use `make test` inside the root directory of the source code.

If you want to build this project, use `make package`, which is not implemented yet.

# Design

Every element of Minecraft is packed into **package**. For example, the game version 1.11.2 itself maybe a package. The default assets of this version is another package. If you want mods, Forge or Optifine can also be packages.

Every instance of game is build from a **profile**. Each **profile** decribes the package contained in this profile and the settings of it.

Packages can have dependency on other packages, which gives us ability to make **meta package** for mod packs, customized integration, etc.

## Directory organization

- [src]
- [Game]
	- [.minecraft]
		- [saves]
		- [resourcepacks]
		- [...]
	- xxx.profile.json
	- Default.profile.json
	- GlobalProfile.json
	- [gamedir]
		- [assets]
			- ...
		- [libs]
			- ...
		- [versions]
			- 1.11.2.jar
			- [1.11.2-natives]
		- [versions_descriptor]
			- 1.11.2.json

# LICENSE / etc.

## Other's work
- node.webkit (NW.js)
- UIKit
- We are greatful to the authors of these great products. Although UIKit is directly bundled in the code, the UIKit part of the project follows its original license.

## About the License
- This License only applies to the Launcher itself, the packages used by the launcher and the profile created are not appliable to this License. Those packages can follow their own License.
- This software (not including its service) is licensed under AGPL. Dynamic linking is treated as using the source code.
- If you need to use this software under other license or using it in commercial usage, please contact us for a license.
- Fork of this repository does not change the License and its conditions.
- All rights reserved by us (the original developer, InnovaCreation).
- The name/brand/logo is owned by the orignal author, please use them under the License.

## 关于许可证
- 本许可证使用于本启动器自身，对启动器的包(Package)与配置文件(Profile)没有任何效力。包自身可以遵循其它协议。
* 本软件(不包括其提供的服务)使用AGPL授权，动态链接视为对代码的引用。
* 如需以其它协议个人/商业使用，请与我们联系。
* Fork该repository不改变本协议与附加要求。
* 我们（原作者，InnovaCreation）保留对该游戏/引擎的一切权利。
* 本软件的名称与商标为原作者所有，禁止随意使用。
