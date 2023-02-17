在命名和注释内使用到的词汇表
----------------

I. 音符类
- NOTE  音符
- TAP
- STARTAP       星星状的TAP
- TAPSTAR       TAP状的星星
- HOLD
- HOLD头 / HOLD尾 / HOLD体
- TAP型HOLD / 短HOLD
- 短HOLD                      18帧以下，只判定头部的HOLD
- TOUCH HOLD
- 短TOUCH HOLD
- TOUCH
- 叶片          TOUCH周围的叶状物
- SLIDE / STAR                星星头
- SLIDE TRACK                 星星尾（对于链状SLIDE, 指所有LINE）
- SLIDE CHAIN / 人体蜈蚣      链状SLIDE
- SLIDE LINE                  链状SLIDE中的其中一条
- Section                     SLIDE中在一段判定区内的部分
- WIFI
- FIREWORK / HANABI           烟花特效

II. 音符属性
- Break
- Each
- Ex
- NiseEach    时间相隔非常近但不是黄色的伪Each
- 多TOUCH白线 / 重叠TOUCH白框     多个TOUCH重叠时出现的白色框

III. 难以归类的
- 第1次谱面处理     以节拍和Note分割谱面文本  （read_inote）
- 第2次谱面处理     将分割好的谱面文本转换为Note对象  （read_inote）
- 第3次谱面处理     根据谱面流速调整Note对象的与流速有关联的属性  （calculate_speed_related_params_for_notes）
- "第0次谱面处理"     即读入maidata.txt文件内的各个属性到Song对象  （ReadMaimaiData）