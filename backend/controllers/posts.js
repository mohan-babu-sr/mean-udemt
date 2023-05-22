
const Post =  require('../models/post');

exports.createPost = (req,res,next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added successfully!',
            post:  {
                id: createdPost._id,
                ...createdPost
            }
        });
    }).catch(error => {
        res.status(500).json({ message: 'Post not created!' });
    });
}

exports.updatePost = (req,res,next) => {
    let imagePath = req.body.imagePath;
    if(res.file){
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then((response) => {
        if (response.matchedCount > 0) {
            res.status(200).json({ message: 'Post updated!' });
        } else {
            res.status(401).json({ message: 'Not authorized!' });
        }
    }).catch(error => {
        res.status(500).json({ message: "couldn't update post!" });
    });
}

exports.getPosts = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if (pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.find().then(data => {
        fetchedPosts = data;
        return Post.count();
    }).then(count => {
        res.status(200).json({
            message: 'Post fetch successfully!',
            posts: fetchedPosts,
            maxPosts: count
        });
    }).catch(error => {
        res.status(500).json({ message: "Fetching post failed!" });
    });
}

exports.getPost = (req,res,next) => {
    Post.findById(req.params.id).then(data => {
        if(data){
            res.status(200).json(data);
        }else{
            res.status(404).json({ message: 'Post not found!' });
        }
    }).catch(error => {
        res.status(500).json({ message: "Fetching post failed!" });
    });
}

exports.deletePost = (req, res, next) => {
    Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then((response) => {
        console.log(response);
        if (response.deletedCount > 0) {
            res.status(200).json({message: 'Post deleted!'});
        } else {
            res.status(401).json({ message: 'Not authorized!' });
        }
    }).catch(error => {
        res.status(500).json({ message: "Post not found!" });
    });
}